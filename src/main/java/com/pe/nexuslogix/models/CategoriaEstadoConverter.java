package com.pe.nexuslogix.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class CategoriaEstadoConverter implements AttributeConverter<Boolean, String> {

    @Override
    public String convertToDatabaseColumn(Boolean attribute) {
        if (attribute == null) return "ACTIVO";
        return attribute ? "ACTIVO" : "INACTIVO";
    }

    @Override
    public Boolean convertToEntityAttribute(String dbData) {
        if (dbData == null) return false;
        return "ACTIVO".equalsIgnoreCase(dbData) || "1".equals(dbData) || "true".equalsIgnoreCase(dbData);
    }
}
