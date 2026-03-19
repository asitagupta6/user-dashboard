import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { User, UserRole } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, UserFormComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  users$: Observable<User[]>;
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];

  isModalOpen = false;

  // Chart
  chartLoading = true;
  private chartInstance: any = null;
  private Chart: any = null;

  // Pagination
  currentPage = 1;
  pageSize = 8;
  totalPages = 1;

  // Filters
  searchQuery = '';
  filterRole = '';

  // Legend
  legendItems: { label: string; color: string; count: number; pct: string }[] = [];

  Math = Math;
  private subscription = new Subscription();

  private readonly ROLE_COLORS: Record<UserRole, string> = {
    Admin: '#1c4980',
    Editor: '#059669',
    Viewer: '#7c3aed',
  };

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.users$ = this.userService.users$;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.users$.subscribe((users) => {
        this.allUsers = users;
        this.applyFilters();
        this.updateChart();
        this.cdr.markForCheck();
      })
    );

    // Lazy-load Chart.js
    this.loadChartJs();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  private async loadChartJs(): Promise<void> {
    try {
      // Dynamic import - Chart.js is lazy-loaded only when component initializes
      const chartModule = await import('chart.js/auto');
      this.Chart = chartModule.default;
      this.chartLoading = false;
      this.cdr.detectChanges();
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.ngZone.run(() => this.initChart());
        }, 50);
      });
    } catch (err) {
      console.error('Failed to load Chart.js', err);
      this.chartLoading = false;
      this.cdr.detectChanges();
    }
  }

  private initChart(): void {
    if (!this.Chart || !this.chartCanvas?.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const dist = this.userService.getRoleDistribution();

    this.chartInstance = new this.Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Admin', 'Editor', 'Viewer'],
        datasets: [
          {
            data: [dist.Admin, dist.Editor, dist.Viewer],
            backgroundColor: [
              this.ROLE_COLORS.Admin,
              this.ROLE_COLORS.Editor,
              this.ROLE_COLORS.Viewer,
            ],
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const pct = total > 0 ? ((context.raw / total) * 100).toFixed(1) : '0';
                return ` ${context.label}: ${context.raw} (${pct}%)`;
              },
            },
          },
        },
        animation: { duration: 500 },
      },
    });

    this.updateLegend(dist);
  }

  private updateChart(): void {
    if (!this.chartInstance) return;
    const dist = this.userService.getRoleDistribution();
    this.chartInstance.data.datasets[0].data = [dist.Admin, dist.Editor, dist.Viewer];
    this.chartInstance.update();
    this.updateLegend(dist);
  }

  private updateLegend(dist: Record<UserRole, number>): void {
    const total = dist.Admin + dist.Editor + dist.Viewer;
    this.legendItems = (['Admin', 'Editor', 'Viewer'] as UserRole[]).map((role) => ({
      label: role,
      color: this.ROLE_COLORS[role],
      count: dist[role],
      pct: total > 0 ? ((dist[role] / total) * 100).toFixed(0) : '0',
    }));
  }

  getRoleCount(role: UserRole): number {
    return this.allUsers.filter((u) => u.role === role).length;
  }

  // Filters & Pagination
  applyFilters(): void {
    let result = [...this.allUsers];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    if (this.filterRole) {
      result = result.filter((u) => u.role === this.filterRole);
    }

    this.filteredUsers = result;
    this.totalPages = Math.ceil(result.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.updatePage();
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilter(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Modal - lazy-loaded via dynamic import on first open
  async openModal(): Promise<void> {
    await import('../user-form/user-form.component');
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onUserAdded(userData: Omit<User, 'id' | 'createdAt'>): void {
    this.userService.addUser(userData);
    this.closeModal();
  }
}
