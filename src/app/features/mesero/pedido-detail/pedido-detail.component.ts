import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoResponse } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-pedido-detail',
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './pedido-detail.component.html',
  styleUrl: './pedido-detail.component.css'
})
export class PedidoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);

  pedido = signal<PedidoResponse | null>(null);
  message = signal('');

  ngOnInit(): void {
    this.loadPedido();
  }

  loadPedido(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.pedidoService.getById(id).subscribe(data => this.pedido.set(data));
  }

  cerrarPedido(): void {
    const p = this.pedido();
    if (!p) return;
    this.pedidoService.cerrar(p.id).subscribe({
      next: (updated) => {
        this.pedido.set(updated);
        this.message.set('Pedido cerrado exitosamente.');
      },
      error: (err) => this.message.set(err.error?.detail ?? 'Error al cerrar.')
    });
  }

  registrarPago(): void {
    const p = this.pedido();
    if (!p) return;
    this.pedidoService.registrarPago(p.id).subscribe({
      next: () => {
        this.loadPedido();
        this.message.set('Pago registrado exitosamente.');
      },
      error: (err) => this.message.set(err.error?.detail ?? 'Error al registrar pago.')
    });
  }

  eliminarPedido(): void {
    const p = this.pedido();
    if (!p) return;
    this.pedidoService.delete(p.id).subscribe({
      next: () => this.router.navigate(['/mesero/pedidos']),
      error: (err) => this.message.set(err.error?.detail ?? 'Error al eliminar.')
    });
  }
}
