-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: nexuslogix_wms
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `nexuslogix_wms`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `nexuslogix_wms` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `nexuslogix_wms`;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVO',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Seguridad Industrial (EPP)','Equipos normados de protecci??n personal (ANSI/OSHA)','ACTIVO','2026-09-12 03:12:55'),(2,'Embalaje y Sellado de Carga','Insumos pesados para aseguramiento de pallets y bultos','ACTIVO','2026-09-12 03:12:55'),(3,'Herramientas de Carga y Maniobra','Equipamiento hidr??ulico y manual de manipulaci??n de peso','ACTIVO','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ruc` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion_fiscal` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_nombre` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sector_industrial` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Miner??a y Construcci??n',
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVO',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ruc` (`ruc`),
  KEY `idx_clientes_ruc` (`ruc`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'20512345678','Consorcio Minero del Sur S.A.A.','Av. Manuel Olgu??n 335, Of. 1201, Surco, Lima','01-7104500','Ing. Roberto Alarc??n','987654321','compras@mineradelsur.pe','Miner??a a Tajo Abierto (Cuajone)','ACTIVO','2026-09-12 03:12:55'),(2,'20458963211','Constructora e Inmobiliaria Los Andes S.A.C.','Av. Rep??blica de Panam?? 3540, San Isidro, Lima','01-4458962','Ing. Roberto Silva','976543210','compras@losandes.pe','Construcci??n e Infraestructura Vial','ACTIVO','2026-09-12 03:12:55'),(3,'20512398744','Distribuidora Industrial del Norte E.I.R.L.','Av. Nicol??s Ayll??n 1250, Ate, Lima','01-3265412','Lic. Patricia Vega','965432109','logistica@disnorte.com.pe','Distribuci??n Mayorista de Ferreter??a','ACTIVO','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `despachos`
--

DROP TABLE IF EXISTS `despachos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `despachos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `operador_id` int NOT NULL,
  `guia_remision` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transportista_razon_social` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transportista_ruc` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `placa_vehiculo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conductor_nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conductor_licencia` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_qr` text COLLATE utf8mb4_unicode_ci,
  `fecha_salida` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_entrega_real` datetime DEFAULT NULL,
  `conformidad_recepcion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('EN_RUTA','ENTREGADO','DEVUELTO','INCIDENCIA') COLLATE utf8mb4_unicode_ci DEFAULT 'EN_RUTA',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pedido_id` (`pedido_id`),
  UNIQUE KEY `guia_remision` (`guia_remision`),
  KEY `fk_despachos_operador` (`operador_id`),
  KEY `idx_despachos_guia` (`guia_remision`),
  KEY `idx_despachos_estado` (`estado`),
  CONSTRAINT `fk_despachos_operador` FOREIGN KEY (`operador_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_despachos_pedidos` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `despachos`
--

LOCK TABLES `despachos` WRITE;
/*!40000 ALTER TABLE `despachos` DISABLE KEYS */;
INSERT INTO `despachos` VALUES (1,1,3,'GR-001-0008942','Transportes R??pidos Lima Cargo S.A.C.','20556677889','B7F-892','Mariano Gonzales Paucar','Q-44589632','https://cpe.sunat.gob.pe/consultas/guia?id=GR-001-0008942&ruc=20608945123','2026-09-11 22:12:55',NULL,NULL,'EN_RUTA','Cami??n furg??n cerrado de 5TN. Precinto de seguridad N?? LK-9923.','2026-09-12 03:12:55','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `despachos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedidos`
--

DROP TABLE IF EXISTS `detalle_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `estado_picking` enum('PENDIENTE','RECOLECTADO','NO_DISPONIBLE') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
  PRIMARY KEY (`id`),
  KEY `fk_detalle_pedidos` (`pedido_id`),
  KEY `fk_detalle_productos` (`producto_id`),
  CONSTRAINT `fk_detalle_pedidos` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detalle_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedidos`
--

LOCK TABLES `detalle_pedidos` WRITE;
/*!40000 ALTER TABLE `detalle_pedidos` DISABLE KEYS */;
INSERT INTO `detalle_pedidos` VALUES (1,1,5,1,1250.00,1250.00,'RECOLECTADO'),(2,2,1,4,45.50,182.00,'PENDIENTE'),(3,2,3,6,36.00,216.00,'PENDIENTE'),(4,2,2,8,18.00,144.00,'PENDIENTE');
/*!40000 ALTER TABLE `detalle_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_auditoria`
--

DROP TABLE IF EXISTS `logs_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_auditoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `tipo_evento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalle` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_origen` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '200 OK',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_usuarios` (`usuario_id`),
  KEY `idx_audit_fecha` (`fecha`),
  CONSTRAINT `fk_audit_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_auditoria`
--

LOCK TABLES `logs_auditoria` WRITE;
/*!40000 ALTER TABLE `logs_auditoria` DISABLE KEYS */;
INSERT INTO `logs_auditoria` VALUES (1,1,'AUTH_LOGIN_SUCCESS','Inicio de sesi??n exitoso de administrador y generaci??n de token JWT Bearer','192.168.1.15','200 OK','2026-09-12 03:12:55'),(2,4,'ORDER_CREATED_B2B','Cliente Consorcio Minero emiti?? la orden PED-2026-0001 por S/ 1,250.00 desde Portal B2B','190.234.12.88','201 CREATED','2026-09-12 03:12:55'),(3,3,'DISPATCH_CONFIRMED','Operador Jorge Quispe emiti?? Gu??a Electr??nica GR-001-0008942 para cami??n B7F-892','192.168.1.42','200 OK','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `logs_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_inventario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `tipo_movimiento` enum('INGRESO','SALIDA','AJUSTE','RESERVA') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `stock_anterior` int NOT NULL,
  `stock_posterior` int NOT NULL,
  `referencia_documento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_mov_productos` (`producto_id`),
  KEY `fk_mov_usuarios` (`usuario_id`),
  KEY `idx_mov_fecha` (`fecha`),
  CONSTRAINT `fk_mov_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
INSERT INTO `movimientos_inventario` VALUES (1,1,2,'INGRESO',150,0,150,'OC-PROV-2026-001','Inventario inicial auditado en almac??n','2026-09-12 03:12:55'),(2,2,2,'INGRESO',320,0,320,'OC-PROV-2026-001','Inventario inicial auditado en almac??n','2026-09-12 03:12:55'),(3,3,2,'INGRESO',85,0,85,'OC-PROV-2026-002','Lote de cintas recibido de fabricante','2026-09-12 03:12:55'),(4,4,2,'INGRESO',60,0,60,'OC-PROV-2026-002','Lote de film stretch recibido de fabricante','2026-09-12 03:12:55'),(5,5,2,'INGRESO',8,0,8,'OC-PROV-2026-003','Adquisici??n de maquinaria pesada manual','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo_pedido` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `usuario_solicitante_id` int NOT NULL,
  `fecha_pedido` datetime DEFAULT CURRENT_TIMESTAMP,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `igv` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `direccion_entrega` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_entrega_estimada` date DEFAULT NULL,
  `estado` enum('PENDIENTE','EN_PREPARACION','LISTO_DESPACHO','EN_RUTA','ENTREGADO','CANCELADO') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDIENTE',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_pedido` (`codigo_pedido`),
  KEY `fk_pedidos_clientes` (`cliente_id`),
  KEY `fk_pedidos_usuarios` (`usuario_solicitante_id`),
  KEY `idx_pedidos_codigo` (`codigo_pedido`),
  KEY `idx_pedidos_estado` (`estado`),
  CONSTRAINT `fk_pedidos_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pedidos_usuarios` FOREIGN KEY (`usuario_solicitante_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,'PED-2026-0001',1,4,'2026-09-10 09:15:00',1059.32,190.68,1250.00,'Campamento Mina Cuajone - Almac??n Central Nivel 3, Moquegua','2026-09-12','EN_RUTA','Prioridad operativa: Repuesto cr??tico de maniobra para guardia de noche','2026-09-12 03:12:55','2026-09-12 03:12:55'),(2,'PED-2026-0002',2,1,'2026-09-10 11:30:00',462.71,83.29,546.00,'Obra Residencial Los Andes, Av. Benavides 4500, Surco, Lima','2026-09-11','PENDIENTE','Entrega en horario de 08:00 a 12:00 hrs con orden de compra f??sica','2026-09-12 03:12:55','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria_id` int NOT NULL,
  `codigo_sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNIDAD',
  `precio_unitario` decimal(10,2) NOT NULL,
  `stock_actual` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '10',
  `ubicacion_pasillo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `peso_kg` decimal(8,2) DEFAULT '0.00',
  `estado` enum('DISPONIBLE','STOCK_BAJO','AGOTADO','DISCONTINUADO') COLLATE utf8mb4_unicode_ci DEFAULT 'DISPONIBLE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_sku` (`codigo_sku`),
  KEY `fk_productos_categorias` (`categoria_id`),
  KEY `idx_productos_sku` (`codigo_sku`),
  KEY `idx_productos_estado` (`estado`),
  CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,1,'EPP-001','Casco de Seguridad Industrial 3M H-700','Casco diel??ctrico clase E con suspensi??n de 4 puntos y ajuste tipo ratchet','UNIDAD',45.50,150,20,'PASILLO-A-01',0.42,'DISPONIBLE','2026-09-12 03:12:55','2026-09-12 03:12:55'),(2,1,'EPP-002','Guantes de Nitrilo Industrial Alta Resistencia','Guantes con recubrimiento total resistente a aceites, hidrocarburos y abrasi??n','PAR',18.00,320,50,'PASILLO-A-02',0.15,'DISPONIBLE','2026-09-12 03:12:55','2026-09-12 03:12:55'),(3,2,'EMB-101','Cinta de Embalaje Transparente 2x100m (Pack x6)','Cinta adhesiva acr??lica para sellado herm??tico de cajas de cart??n pesado','PACK',36.00,85,15,'PASILLO-B-05',1.80,'DISPONIBLE','2026-09-12 03:12:55','2026-09-12 03:12:55'),(4,2,'EMB-102','Film Stretch Industrial 20 micras (Rollo 500m)','Pel??cula estirable tricapa de alta adherencia para paletizado industrial','ROLLO',52.00,60,10,'PASILLO-B-06',4.20,'DISPONIBLE','2026-09-12 03:12:55','2026-09-12 03:12:55'),(5,3,'HER-201','Transpaleta Manual Hidr??ulica 3 Toneladas','Carretilla de carga con horquillas de acero reforzado y ruedas de poliuretano','UNIDAD',1250.00,8,2,'ZONA-MAQUINARIA',75.00,'STOCK_BAJO','2026-09-12 03:12:55','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ROLE_ADMINISTRADOR','Control total, gesti??n de usuarios, dashboard ejecutivo y auditor??a','2026-09-12 03:12:55'),(2,'ROLE_JEFE_ALMACEN','Gesti??n de cat??logo de suministros, ubicaciones y kardex de existencias','2026-09-12 03:12:55'),(3,'ROLE_OPERADOR_DESPACHO','Preparaci??n de picking, asignaci??n de transporte y emisi??n de gu??as','2026-09-12 03:12:55'),(4,'ROLE_CLIENTE_COMERCIAL','Portal B2B: consulta de stock en tiempo real y solicitud de pedidos','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rol_id` int NOT NULL,
  `cliente_id` int DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `area` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVO',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuarios_roles` (`rol_id`),
  KEY `fk_usuarios_clientes` (`cliente_id`),
  KEY `idx_usuarios_username` (`username`),
  KEY `idx_usuarios_email` (`email`),
  CONSTRAINT `fk_usuarios_clientes` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,1,NULL,'admin','admin@nexuslogix.pe','admin123password','Carlos','Mendoza','Gerencia de Operaciones','ACTIVO','2026-09-12 03:12:55','2026-09-12 03:12:55'),(2,2,NULL,'almacen.lead','m.rojas@nexuslogix.pe','almacen123password','Manuel','Rojas','Almac??n Central Lur??n','ACTIVO','2026-09-12 03:12:55','2026-09-12 03:12:55'),(3,3,NULL,'despacho.op','j.quispe@nexuslogix.pe','despacho123password','Jorge','Quispe','Distribuci??n y Flota','ACTIVO','2026-09-12 03:12:55','2026-09-12 03:12:55'),(4,4,1,'cliente.minero','r.alarcon@mineradelsur.pe','minero123password','Roberto','Alarc??n','Log??stica Mina Cuajone','ACTIVO','2026-09-12 03:12:55','2026-09-12 03:12:55');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-14 23:23:04
