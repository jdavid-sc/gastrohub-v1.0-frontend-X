import { Component, signal, inject, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PagoService } from '../../../../core/services/pago.service';
import { PagoResponse } from '../../../../core/models/pedido.model';

@Component({
  selector: 'app-pago-list',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './pago-list.component.html',
  styleUrl: './pago-list.component.css'
})
export class PagoListComponent implements OnInit {
  private pagoService = inject(PagoService);
  pagos = signal<PagoResponse[]>([]);

  ngOnInit(): void {
    this.pagoService.getAll().subscribe(data => this.pagos.set(data));
  }
}
