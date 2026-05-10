import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStateService } from '../../../../shared/services/auth-state.service';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  usuario = '';
  password = '';
  loading = false;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  constructor(
    private authService: AuthStateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onLogin() {
    if (!this.usuario || !this.password) {
      this.showError('Debe ingresar usuario y contraseña');
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login(this.usuario, this.password).subscribe({
      next: () => {
        queueMicrotask(() => {
          this.loading = false;
          this.showSuccess('Inicio de sesión exitoso');
          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        });
      },
      error: (err: any) => {
        queueMicrotask(() => {
          this.loading = false;

          if (err.status === 401) {
            this.showError('Usuario o contraseña incorrectos');
          } else if (err.status === 400) {
            this.showError('Datos inválidos. Verifique usuario y contraseña');
          } else if (err.status === 500) {
            this.showError('Error del servidor. Intente más tarde');
          } else if (err.status === 0) {
            this.showError('No se puede conectar al servidor');
          } else {
            this.showError('Error desconocido. Intente nuevamente');
          }

          this.cdr.detectChanges();
        });
      },
    });
  }

  private showSuccess(msg: string) {
    this.toastMessage = msg;
    this.toastType = 'success';
    this.showToast = true;
  }

  private showError(msg: string) {
    this.toastMessage = msg;
    this.toastType = 'error';
    this.showToast = true;
  }

  onCloseToast() {
    this.showToast = false;
    this.cdr.detectChanges();
  }
}
