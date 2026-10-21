import guardedInstance from "../instances/guardedInstance";
import { IncomeCalculationDocument } from "../models/IncomeCalculation";

export const createIncomeCalculation = async (data: IncomeCalculationDocument) => {
  const response = await guardedInstance.post(`/income-calculation/Save`, data);
  return response.data;
};

export const updateIncomeCalculation = async (
  id: string,
  data: IncomeCalculationDocument
) => {
  const response = await guardedInstance.put(`/income-calculation/Update?id=${id}`, data);
  return response.data;
};

export const getIncomeCalculationsByScenarioId = async (scenarioId: string) => {
  const response = await guardedInstance.get(
    `/income-calculation/GetByScenarioId?scenarioId=${scenarioId}`
  );
  return response.data;
};

export const deleteIncomeCalculationById = async (id: string) => {
  const response = await guardedInstance.delete(
    `/income-calculation/DeleteById?id=${id}`
  );
  return response.data;
};
