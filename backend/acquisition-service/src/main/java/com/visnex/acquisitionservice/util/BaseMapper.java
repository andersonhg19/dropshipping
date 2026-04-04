package com.visnex.acquisitionservice.util;

import java.util.List;

/**
 * Interfaz base para mapeo bidireccional con listas incluidas.
 *
 * @param <E> Entity
 * @param <InputDTO> DTO usado para creacion/edicion
 * @param <OutputDTO> DTO usado para resultados
 */
public interface BaseMapper<E, InputDTO, OutputDTO> {

    OutputDTO toDTO(E entity);

    List<OutputDTO> toDTOList(List<E> entities);

    E toEntity(InputDTO dto);

    List<E> toEntityList(List<InputDTO> dtos);
}
