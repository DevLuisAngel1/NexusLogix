package pe.com.nexuslogix.wms.models;

/**
 * Roles del sistema NexusLogix WMS:
 * - ROLE_ADMIN: Administrador General y Jefe de Operaciones.
 * - ROLE_ALMACEN: Jefe y Operarios de Bodega (picking físico, racks, despacho).
 * - ROLE_CLIENTE: Clientes B2B Corporativos (Portal B2B, órdenes de despacho).
 */
public enum ERole {
    ROLE_ADMIN,
    ROLE_ALMACEN,
    ROLE_CLIENTE
}
