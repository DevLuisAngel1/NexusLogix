package com.pe.nexuslogix.models;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ProductoInventarioTest {
    @Test void stockCeroEsAgotado() { assertEstado(0, 10, EstadoInventario.AGOTADO); }
    @Test void stockMenorAlMinimoEsBajo() { assertEstado(5, 10, EstadoInventario.STOCK_BAJO); }
    @Test void stockIgualAlMinimoEsBajo() { assertEstado(10, 10, EstadoInventario.STOCK_BAJO); }
    @Test void stockMayorAlMinimoEsNormal() { assertEstado(15, 10, EstadoInventario.NORMAL); }
    @Test void minimoIndividualSeAplica() { assertEstado(5, 5, EstadoInventario.STOCK_BAJO); }

    private void assertEstado(int actual, int minimo, EstadoInventario esperado) {
        Producto producto = new Producto();
        producto.setStockActual(actual);
        producto.setStockMinimo(minimo);
        assertEquals(esperado, producto.getEstadoInventario());
    }
}
