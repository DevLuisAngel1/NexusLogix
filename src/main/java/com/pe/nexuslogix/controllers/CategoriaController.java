package com.pe.nexuslogix.controllers;

import com.pe.nexuslogix.models.Categoria;
import com.pe.nexuslogix.services.CategoriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // GET /api/categorias
    @GetMapping
    public ResponseEntity<List<Categoria>> listarTodas() {
        return ResponseEntity.ok(
                categoriaService.listarTodas()
        );
    }

    // GET /api/categorias/activas
    @GetMapping("/activas")
    public ResponseEntity<List<Categoria>> listarActivas() {
        return ResponseEntity.ok(
                categoriaService.listarActivas()
        );
    }

    // GET /api/categorias/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(
            @PathVariable Long id
    ) {

        return categoriaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/categorias
    @PostMapping
    public ResponseEntity<Categoria> crear(
            @RequestBody Categoria categoria
    ) {

        try {

            Categoria nuevaCategoria =
                    categoriaService.guardar(categoria);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(nuevaCategoria);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // PUT /api/categorias/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizar(
            @PathVariable Long id,
            @RequestBody Categoria categoria
    ) {

        try {

            Categoria categoriaActualizada =
                    categoriaService.actualizar(id, categoria);

            return ResponseEntity.ok(
                    categoriaActualizada
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    // DELETE /api/categorias/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {

        try {

            categoriaService.eliminar(id);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity.notFound().build();
        }
    }
}