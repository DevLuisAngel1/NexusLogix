package com.pe.nexuslogix.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ProductoEstadoConverter implements AttributeConverter<Boolean, String> {

    @Override
    public String convertToDatabaseColumn(Boolean attribute) {
        if (attribute == null) return "DISPONIBLE";
        return attribute ? "DISPONIBLE" : "DISCONTINUADO";
    }

    @Override
    public Boolean convertToEntityAttribute(String dbData) {
        if (dbData == null) return false;
        return !"DISCONTINUADO".equalsIgnoreCase(dbData) && !"INACTIVO".equalsIgnoreCase(dbData) && !"0".equals(dbData) && !"false".equalsIgnoreCase(dbData);
    }
}
