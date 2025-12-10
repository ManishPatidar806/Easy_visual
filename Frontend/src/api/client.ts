const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/ml/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
}

export async function preprocessData(pipelineId: string, scalerType: string, columns: string[]) {
  const response = await fetch(`${API_BASE_URL}/ml/preprocess`, {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Preprocessing failed');
  }

  return response.json();
}

export async function splitData(pipelineId: string, splitRatio: number, targetColumn: string) {
  const response = await fetch(`${API_BASE_URL}/ml/split`, {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Split failed');
  }

  return response.json();
}

export async function trainModel(pipelineId: string, modelType: string) {
  const response = await fetch(`${API_BASE_URL}/ml/train`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pipeline_id: pipelineId,
      model_type: modelType,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Training failed');
  }

  return response.json();
}

export async function getResults(pipelineId: string) {
  const response = await fetch(`${API_BASE_URL}/ml/results/${pipelineId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get results');
  }

  return response.json();
}
