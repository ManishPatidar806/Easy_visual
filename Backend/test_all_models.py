"""
Test script to verify all ML models work correctly
Tests: Logistic Regression, Decision Tree, Random Forest
"""

import asyncio
import pandas as pd
import numpy as np
from sklearn.datasets import make_classification
from app.services.ml_service import MLService
import io

async def test_all_models():
    """Test all model types with a sample dataset"""
    
    print("=" * 60)
    print("🧪 TESTING ALL ML MODELS")
    print("=" * 60)
    
    # Create a test classification dataset
    print("\n📊 Creating test dataset...")
    X, y = make_classification(
        n_samples=200,
        n_features=5,
        n_informative=3,
        n_redundant=1,
        n_classes=3,
        random_state=42
    )
    
    df = pd.DataFrame(X, columns=[f'feature_{i}' for i in range(5)])
    df['target'] = y
    
    # Save to CSV bytes
    csv_buffer = io.BytesIO()
    df.to_csv(csv_buffer, index=False)
    csv_bytes = csv_buffer.getvalue()
    
    print(f"✅ Dataset created: {len(df)} rows, {len(df.columns)} columns")
    print(f"   Features: {list(df.columns[:-1])}")
    print(f"   Target: {df.columns[-1]} (classes: {sorted(df['target'].unique())})")
    
    # Test each model type
    models = [
        ("logistic_regression", "Logistic Regression"),
        ("decision_tree", "Decision Tree"),
        ("random_forest", "Random Forest")
    ]
    
    results = {}
    
    for model_type, model_name in models:
        print(f"\n{'=' * 60}")
        print(f"🔬 Testing: {model_name}")
        print(f"{'=' * 60}")
        
        try:
            # Step 1: Upload dataset
            print(f"  Step 1: Uploading dataset...")
            pipeline_id, dataset_info = await MLService.upload_dataset(
                csv_bytes, 
                "test_data.csv"
            )
            print(f"  ✅ Upload successful - Pipeline ID: {pipeline_id}")
            print(f"     Dataset: {dataset_info['rows']} rows, {dataset_info['columns']} columns")
            
            # Step 2: Preprocess (optional - test with StandardScaler)
            print(f"  Step 2: Preprocessing data...")
            preprocess_result = await MLService.preprocess_data(
                pipeline_id=pipeline_id,
                columns=[f'feature_{i}' for i in range(5)],
                scaler_type="standardization"
            )
            print(f"  ✅ Preprocessing successful")
            print(f"     Method: {preprocess_result.get('message', 'N/A')}")
            print(f"     Columns scaled: {len(preprocess_result['processed_columns'])}")
            
            # Step 3: Split data
            print(f"  Step 3: Splitting data...")
            split_result = await MLService.split_data(
                pipeline_id=pipeline_id,
                target_column="target",
                split_ratio=0.8
            )
            print(f"  ✅ Split successful")
            print(f"     Train: {split_result['train_size']} samples")
            print(f"     Test: {split_result['test_size']} samples")
            
            # Step 4: Train model
            print(f"  Step 4: Training {model_name}...")
            train_result = await MLService.train_model(
                pipeline_id=pipeline_id,
                model_type=model_type
            )
            print(f"  ✅ Training successful!")
            print(f"     Train Accuracy: {train_result['train_accuracy']:.4f}")
            print(f"     Test Accuracy: {train_result['test_accuracy']:.4f}")
            print(f"     Precision: {train_result['metrics']['precision']:.4f}")
            print(f"     Recall: {train_result['metrics']['recall']:.4f}")
            print(f"     F1-Score: {train_result['metrics']['f1_score']:.4f}")
            
            # Step 5: Get results with visualizations
            print(f"  Step 5: Generating results and visualizations...")
            results_data = await MLService.get_results(pipeline_id)
            print(f"  ✅ Results generated successfully!")
            
            if results_data.get('visualizations'):
                viz_count = len(results_data['visualizations'])
                print(f"     Visualizations created: {viz_count}")
                for viz_name in results_data['visualizations'].keys():
                    print(f"       - {viz_name}")
            
            # Store results
            results[model_name] = {
                "status": "✅ PASSED",
                "train_accuracy": train_result['train_accuracy'],
                "test_accuracy": train_result['test_accuracy'],
                "metrics": train_result['metrics'],
                "visualizations": len(results_data.get('visualizations', {}))
            }
            
            print(f"\n  🎉 {model_name} - ALL TESTS PASSED!")
            
        except Exception as e:
            print(f"\n  ❌ {model_name} - TEST FAILED!")
            print(f"     Error: {str(e)}")
            results[model_name] = {
                "status": "❌ FAILED",
                "error": str(e)
            }
    
    # Summary
    print(f"\n\n{'=' * 60}")
    print("📋 TEST SUMMARY")
    print(f"{'=' * 60}")
    
    passed = sum(1 for r in results.values() if r['status'] == "✅ PASSED")
    failed = len(results) - passed
    
    for model_name, result in results.items():
        print(f"\n{model_name}:")
        print(f"  Status: {result['status']}")
        if result['status'] == "✅ PASSED":
            print(f"  Train Accuracy: {result['train_accuracy']:.4f}")
            print(f"  Test Accuracy: {result['test_accuracy']:.4f}")
            print(f"  F1-Score: {result['metrics']['f1_score']:.4f}")
            print(f"  Visualizations: {result['visualizations']}")
        else:
            print(f"  Error: {result['error']}")
    
    print(f"\n{'=' * 60}")
    print(f"✅ Passed: {passed}/{len(results)}")
    print(f"❌ Failed: {failed}/{len(results)}")
    print(f"{'=' * 60}")
    
    if failed == 0:
        print("\n🎉 ALL MODELS WORKING CORRECTLY! 🎉")
    else:
        print("\n⚠️  Some models have issues. Please review the errors above.")
    
    return results

if __name__ == "__main__":
    asyncio.run(test_all_models())
