const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT = 30000;

class APIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new APIError(408, 'Request timeout - please try again');
    }
    throw new APIError(0, 'Network error - please check your connection');
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new APIError(response.status, errorMessage);
  }
  return response.json();
}

export async function uploadDataset(file: File): Promise<any> {
  if (!file) {
    throw new APIError(400, 'No file provided');
  }
  
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchWithTimeout(`${API_BASE_URL}/ml/upload`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
}

export async function cleanData(pipelineId: string, strategy: string, columns: string[], fillValue?: string): Promise<any> {
  if (!pipelineId) {
    throw new APIError(400, 'Pipeline ID is required');
  }
  
  const body: any = {
    pipeline_id: pipelineId,
    strategy: strategy,
    columns: columns.length > 0 ? columns : null,
  };
  
  if (strategy === 'constant' && fillValue !== undefined) {
    body.fill_value = fillValue;
  }

  const response = await fetchWithTimeout(`${API_BASE_URL}/ml/clean`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

export async function preprocessData(pipelineId: string, scalerType: string, columns: string[]): Promise<any> {
  if (!pipelineId) {
    throw new APIError(400, 'Pipeline ID is required');
  }
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/ml/preprocess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pipeline_id: pipelineId,
      scaler_type: scalerType,
      columns,
    }),
  });

  return handleResponse(response);
}

export async function splitData(pipelineId: string, splitRatio: number, targetColumn: string): Promise<any> {
  if (!pipelineId) {
    throw new APIError(400, 'Pipeline ID is required');
  }
  if (!targetColumn) {
    throw new APIError(400, 'Target column is required');
  }
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/ml/split`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pipeline_id: pipelineId,
      split_ratio: splitRatio,
      target_column: targetColumn,
    }),
  });

  return handleResponse(response);
}

export async function trainModel(pipelineId: string, modelType: string, taskType: string = "classification"): Promise<any> {
  if (!pipelineId) {
    throw new APIError(400, 'Pipeline ID is required');
  }
  if (!modelType) {
    throw new APIError(400, 'Model type is required');
  }
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/ml/train`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pipeline_id: pipelineId,
      model_type: modelType,
      task_type: taskType,
    }),
  });

  return handleResponse(response);
}

export async function getResults(pipelineId: string): Promise<any> {
  if (!pipelineId) {
    throw new APIError(400, 'Pipeline ID is required');
  }
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/ml/results/${pipelineId}`, {
    method: 'GET',
  });

  return handleResponse(response);
}
