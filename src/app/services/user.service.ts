import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _users$ = new BehaviorSubject<User[]>([
    {
      id: uuidv4(),
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Admin',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'Editor',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Carol White',
      email: 'carol@example.com',
      role: 'Viewer',
      createdAt: new Date(),
    },
  ]);

  get users$(): Observable<User[]> {
    return this._users$.asObservable();
  }

  get currentUsers(): User[] {
    return this._users$.getValue();
  }

  addUser(userData: Omit<User, 'id' | 'createdAt'>): void {
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    this._users$.next([...this.currentUsers, newUser]);
  }

  getRoleDistribution(): Record<UserRole, number> {
    const users = this.currentUsers;
    return {
      Admin: users.filter((u) => u.role === 'Admin').length,
      Editor: users.filter((u) => u.role === 'Editor').length,
      Viewer: users.filter((u) => u.role === 'Viewer').length,
    };
  }
}
