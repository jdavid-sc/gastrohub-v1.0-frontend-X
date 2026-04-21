import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagoService } from '../../../../core/services/pago.service';
import { PagoResponse } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-pago-list',
  imports: [DecimalPipe, DatePipe, FormsModule],
  templateUrl: './pago-list.component.html',
  styleUrl: './pago-list.component.css'
})
export class PagoListComponent implements OnInit {
  private pagoService = inject(PagoService);
  pagos = signal<PagoResponse[]>([]);
  busquedaId = signal<string>('');
  buscando = signal<boolean>(false);
  errorBusqueda = signal<string | null>(null);

  readonly pageSize = 10;
  paginaActual = signal(1);

  pagosOrdenados = computed(() =>
    [...this.pagos()].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  );

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.pagosOrdenados().length / this.pageSize)));

  pagosPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.pageSize;
    return this.pagosOrdenados().slice(inicio, inicio + this.pageSize);
  });

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  ngOnInit(): void {
    this.pagoService.getAll().subscribe(data => this.pagos.set(data));
  }

  buscarPorId(): void {
    const id = parseInt(this.busquedaId(), 10);
    if (isNaN(id) || id <= 0) {
      this.errorBusqueda.set('Ingresa un ID de pago válido.');
      return;
    }
    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.pagoService.getById(id).subscribe({
      next: (pago) => {
        this.pagos.set([pago]);
        this.paginaActual.set(1);
        this.buscando.set(false);
      },
      error: (err) => {
        this.errorBusqueda.set(err?.error?.detail ?? `Pago #${id} no encontrado.`);
        this.pagos.set([]);
        this.buscando.set(false);
      }
    });
  }

  limpiarBusqueda(): void {
    this.busquedaId.set('');
    this.errorBusqueda.set(null);
    this.paginaActual.set(1);
    this.pagoService.getAll().subscribe(data => this.pagos.set(data));
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
  }
}
