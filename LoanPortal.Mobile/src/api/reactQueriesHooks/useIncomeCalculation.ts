import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIncomeCalculation,
  updateIncomeCalculation,
  getIncomeCalculationsByScenarioId,
  deleteIncomeCalculationById,
} from "../network/incomeCalculation";
import { IncomeCalculationDocument } from "../models/IncomeCalculation";

export const useGetIncomeCalculationsByScenarioId = (scenarioId: string) => {
  return useQuery({
    queryKey: ["income-calculations", scenarioId],
    queryFn: () => getIncomeCalculationsByScenarioId(scenarioId),
    enabled: !!scenarioId,
  });
};

export const useCreateIncomeCalculation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IncomeCalculationDocument) =>
      createIncomeCalculation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["income-calculations", variables.scenarioId],
      });
    },
  });
};

export const useUpdateIncomeCalculation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: IncomeCalculationDocument;
    }) => updateIncomeCalculation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["income-calculations", variables.data.scenarioId],
      });
    },
  });
};

export const useDeleteIncomeCalculationById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIncomeCalculationById(id),
    onSuccess: () => {
      // Might need scenarioId to invalidate properly, but usually we can invalidate all or specific if we know it
      queryClient.invalidateQueries({ queryKey: ["income-calculations"] });
    },
  });
};

