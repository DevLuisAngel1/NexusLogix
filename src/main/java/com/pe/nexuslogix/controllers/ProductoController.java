package com.pe.nexuslogix.controllers;

import com.pe.nexuslogix.models.Producto;
import com.pe.nexuslogix.services.ProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // GET /api/productos
    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {

        return ResponseEntity.ok(
                productoService.listarTodos()
        );
    }

    // GET /api/productos/activos
    @GetMapping("/activos")
    public ResponseEntity<List<Producto>> listarActivos() {

        return ResponseEntity.ok(
                productoService.listarActivos()
        );
    }

    // GET /api/productos/stock-bajo & /api/productos/alertas-stock
    @GetMapping({"/stock-bajo", "/alertas-stock"})
    public ResponseEntity<List<Producto>> listarProductosConStockBajo() {

        return ResponseEntity.ok(
                productoService.listarProductosConStockBajo()
        );
    }

    // GET /api/productos/buscar?nombre=casco
    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscarPorNombre(
            @RequestParam String nombre
    ) {

        return ResponseEntity.ok(
                productoService.buscarPorNombre(nombre)
        );
    }

    // GET /api/productos/sku/{sku}
    @GetMapping("/sku/{sku}")
    public ResponseEntity<Producto> buscarPorSku(
            @PathVariable String sku
    ) {

        return productoService.buscarPorSku(sku)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/productos/categoria/{categoriaId}
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Producto>> listarPorCategoria(
            @PathVariable Long categoriaId
    ) {

        return ResponseEntity.ok(
                productoService.listarPorCategoria(categoriaId)
        );
    }

    // GET /api/productos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarPorId(
            @PathVariable Long id
    ) {

        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/productos
    @PostMapping
    public ResponseEntity<Producto> crear(
            @RequestBody Producto producto
    ) {

        try {

            Producto nuevoProducto =
                    productoService.guardar(producto);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(nuevoProducto);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // PUT /api/productos/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(
            @PathVariable Long id,
            @RequestBody Producto producto
    ) {

        try {

            Producto productoActualizado =
                    productoService.actualizar(id, producto);

            return ResponseEntity.ok(
                    productoActualizado
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // DELETE /api/productos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {

        try {

            productoService.eliminar(id);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity.notFound().build();
        }
    }
}