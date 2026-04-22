import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PagoService } from '../../../../core/services/pago.service';
import { PagoResponse } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-pago-list',
  imports: [DecimalPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './pago-list.component.html',
  styleUrl: './pago-list.component.css'
})
export class PagoListComponent implements OnInit {
  private pagoService = inject(PagoService);
  pagos = signal<PagoResponse[]>([]);
  busquedaId = signal<string>('');
  buscando = signal<boolean>(false);
  errorBusqueda = signal<string | null>(null);

  // Filtro por fecha
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  filtrando = signal<boolean>(false);
  errorFiltro = signal<string | null>(null);
  filtroActivo = signal<boolean>(false);

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

  private hoyStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  totalVentasDia = computed(() => {
    if (this.filtroActivo()) {
      return this.pagosOrdenados().reduce((sum, p) => sum + Number(p.total), 0);
    }
    const hoy = this.hoyStr();
    return this.pagos()
      .filter(p => new Date(p.fecha).toISOString().slice(0, 10) === hoy ||
                   p.fecha.slice(0, 10) === hoy)
      .reduce((sum, p) => sum + Number(p.total), 0);
  });

  conteoVentasDia = computed(() => {
    if (this.filtroActivo()) {
      return this.pagosOrdenados().length;
    }
    const hoy = this.hoyStr();
    return this.pagos()
      .filter(p => new Date(p.fecha).toISOString().slice(0, 10) === hoy ||
                   p.fecha.slice(0, 10) === hoy).length;
  });

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

  filtrarFecha(): void {
    const inicio = this.fechaInicio();
    const fin = this.fechaFin();
    if (!inicio || !fin) {
      this.errorFiltro.set('Debes completar ambas fechas.');
      return;
    }
    if (inicio > fin) {
      this.errorFiltro.set('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }
    this.errorFiltro.set(null);
    this.filtrando.set(true);
    this.paginaActual.set(1);
    this.pagoService.filtrarPorFecha(inicio, fin).subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.filtroActivo.set(true);
        this.filtrando.set(false);
      },
      error: (err) => {
        this.errorFiltro.set(err?.error?.detail ?? 'Error al filtrar los pagos.');
        this.filtrando.set(false);
      }
    });
  }

  limpiarFiltro(): void {
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.errorFiltro.set(null);
    this.filtroActivo.set(false);
    this.paginaActual.set(1);
    this.pagoService.getAll().subscribe(data => this.pagos.set(data));
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
  }
}
