package com.pe.nexuslogix.services.impl;

import com.pe.nexuslogix.models.Categoria;
import com.pe.nexuslogix.models.Producto;
import com.pe.nexuslogix.repositories.CategoriaRepository;
import com.pe.nexuslogix.repositories.ProductoRepository;
import com.pe.nexuslogix.services.ProductoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoServiceImpl(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository
    ) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> listarActivos() {
        return productoRepository.findByEstadoTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorSku(String sku) {
        return productoRepository.findByCodigoSkuIgnoreCase(sku);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> listarPorCategoria(Long categoriaId) {

        return productoRepository.findByCategoriaId(categoriaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> listarProductosConStockBajo() {

        return productoRepository
                .findByStockActualLessThanEqualAndEstadoTrue(
                        10
                );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> buscarPorNombre(String nombre) {

        return productoRepository
                .findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    @Transactional
    public Producto guardar(Producto producto) {

        if (productoRepository.existsByCodigoSkuIgnoreCase(producto.getCodigoSku())) {
            throw new IllegalArgumentException(
                    "Ya existe un producto con el SKU: "
                    + producto.getCodigoSku()
            );
        }

        if (producto.getCategoria() == null
                || producto.getCategoria().getId() == null) {

            throw new IllegalArgumentException(
                    "El producto debe tener una categoría"
            );
        }

        Categoria categoria = categoriaRepository
                .findById(producto.getCategoria().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "La categoría indicada no existe"
                ));

        producto.setCategoria(categoria);

        if (producto.getStockActual() == null) {
            producto.setStockActual(0);
        }

        if (producto.getStockMinimo() == null) {
            producto.setStockMinimo(0);
        }

        if (producto.getPrecioUnitario() == null) {
            producto.setPrecioUnitario(0.0);
        }

        if (producto.getPesokg() == null) {
            producto.setPesokg(0.0);
        }

        if (producto.getEstado() == null) {
            producto.setEstado(true);
        }

        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto actualizar(Long id, Producto producto) {

        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el producto con ID: " + id
                ));

        Optional<Producto> productoConMismoSku =
                productoRepository.findByCodigoSkuIgnoreCase(
                        producto.getCodigoSku()
                );

        if (productoConMismoSku.isPresent()
                && !productoConMismoSku.get().getId().equals(id)) {

            throw new IllegalArgumentException(
                    "Ya existe otro producto con el SKU: "
                    + producto.getCodigoSku()
            );
        }

        if (producto.getCategoria() == null
                || producto.getCategoria().getId() == null) {

            throw new IllegalArgumentException(
                    "El producto debe tener una categoría"
            );
        }

        Categoria categoria = categoriaRepository
                .findById(producto.getCategoria().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "La categoría indicada no existe"
                ));

        productoExistente.setCodigoSku(producto.getCodigoSku());
        productoExistente.setNombre(producto.getNombre());
        productoExistente.setDescripcion(producto.getDescripcion());
        productoExistente.setUnidadMedida(producto.getUnidadMedida());
        if (producto.getPrecioUnitario() != null) {
            productoExistente.setPrecioUnitario(producto.getPrecioUnitario());
        }
        if (producto.getStockMinimo() != null) {
            productoExistente.setStockMinimo(producto.getStockMinimo());
        }
        productoExistente.setUbicacionPasillo(producto.getUbicacionPasillo());
        if (producto.getPesokg() != null) {
            productoExistente.setPesokg(producto.getPesokg());
        }
        productoExistente.setCategoria(categoria);

        /*
         * El stockActual NO se modifica aquí.
         *
         * Los cambios de stock deben realizarse mediante
         * InventarioService para generar el Kardex.
         */

        if (producto.getEstado() != null) {
            productoExistente.setEstado(producto.getEstado());
        }

        return productoRepository.save(productoExistente);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe el producto con ID: " + id
                ));

        /*
         * Eliminación lógica.
         */
        producto.setEstado(false);

        productoRepository.save(producto);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existePorSku(String sku) {
        return productoRepository.existsByCodigoSkuIgnoreCase(sku);
    }
}
