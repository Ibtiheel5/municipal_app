package com.municipal.auth.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class RecetteStatsMensuelles {
    private List<String> mois;
    private List<Double> montants;
}