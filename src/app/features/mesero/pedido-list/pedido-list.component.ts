import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoResponse } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-pedido-list',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './pedido-list.component.html',
  styleUrl: './pedido-list.component.css'
})
export class PedidoListComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  pedidos = signal<PedidoResponse[]>([]);

  ngOnInit(): void {
    this.pedidoService.getAll().subscribe(data => this.pedidos.set(data));
  }
}
