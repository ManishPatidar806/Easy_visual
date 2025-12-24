"""
Test script for data cleaning functionality
Tests all 7 cleaning strategies:
1. drop_rows - Remove rows with missing values
2. drop_columns - Remove columns with missing values
3. mean - Fill with column mean (numeric only)
4. median - Fill with column median (numeric only)
5. mode - Fill with column mode (most frequent value)
6. forward_fill - Forward fill (use previous value)
7. constant - Fill with a constant value
"""

import requests
import pandas as pd
import numpy as np
import os

# Configuration
BASE_URL = "http://localhost:8000/api"

def create_test_dataset_with_missing():
    """Create a test dataset with missing values"""
    np.random.seed(42)
    n_rows = 100
    
    data = {
        'age': np.random.randint(18, 80, n_rows).astype(float),
        'income': np.random.randint(20000, 120000, n_rows).astype(float),
        'score': np.random.uniform(0, 100, n_rows),
        'category': np.random.choice(['A', 'B', 'C', 'D'], n_rows),
        'status': np.random.choice(['active', 'inactive', 'pending'], n_rows)
    }
    
    df = pd.DataFrame(data)
    
    # Introduce missing values in different columns
    # Age: 10% missing
    missing_age_idx = np.random.choice(n_rows, size=10, replace=False)
    df.loc[missing_age_idx, 'age'] = np.nan
    
    # Income: 15% missing
    missing_income_idx = np.random.choice(n_rows, size=15, replace=False)
    df.loc[missing_income_idx, 'income'] = np.nan
    
    # Score: 5% missing
    missing_score_idx = np.random.choice(n_rows, size=5, replace=False)
    df.loc[missing_score_idx, 'score'] = np.nan
    
    # Category: 8% missing
    missing_cat_idx = np.random.choice(n_rows, size=8, replace=False)
    df.loc[missing_cat_idx, 'category'] = None
    
    # Status: 12% missing
    missing_status_idx = np.random.choice(n_rows, size=12, replace=False)
    df.loc[missing_status_idx, 'status'] = None
    
    return df

def test_cleaning_strategy(strategy, columns=None, fill_value=None):
    """Test a specific cleaning strategy"""
    print(f"\n{'='*60}")
    print(f"Testing Strategy: {strategy.upper()}")
    print(f"Columns: {columns if columns else 'All columns'}")
    if fill_value:
        print(f"Fill Value: {fill_value}")
    print('='*60)
    
    # Step 1: Create test dataset
    df = create_test_dataset_with_missing()
    test_file = "test_missing_data.csv"
    df.to_csv(test_file, index=False)
    
    print(f"\n✓ Created test dataset with {len(df)} rows")
    print(f"  Missing values per column:")
    for col in df.columns:
        missing = df[col].isna().sum()
        if missing > 0:
            print(f"    - {col}: {missing} missing ({missing/len(df)*100:.1f}%)")
    
    # Step 2: Upload dataset
    with open(test_file, "rb") as f:
        files = {"file": (test_file, f, "text/csv")}
        response = requests.post(f"{BASE_URL}/ml/upload", files=files)
    
    if response.status_code != 200:
        print(f"❌ Upload failed: {response.json()}")
        return False
    
    upload_result = response.json()
    pipeline_id = upload_result["pipeline_id"]
    print(f"✓ Uploaded dataset (Pipeline ID: {pipeline_id})")
    
    # Step 3: Clean data with specified strategy
    clean_data = {
        "pipeline_id": pipeline_id,
        "strategy": strategy,
        "columns": columns
    }
    
    if fill_value is not None:
        clean_data["fill_value"] = fill_value
    
    response = requests.post(f"{BASE_URL}/ml/clean", json=clean_data)
    
    if response.status_code != 200:
        print(f"❌ Cleaning failed: {response.json()}")
        return False
    
    result = response.json()
    
    print(f"\n✓ Data cleaned successfully!")
    print(f"  Rows before: {result['rows_before']}")
    print(f"  Rows after: {result['rows_after']}")
    
    if result['rows_before'] != result['rows_after']:
        print(f"  ⚠️  Row count changed by {result['rows_before'] - result['rows_after']}")
    
    print(f"\n  Missing values after cleaning:")
    total_missing_after = sum(result['missing_after'].values())
    if total_missing_after == 0:
        print(f"    ✓ All missing values handled!")
    else:
        for col, count in result['missing_after'].items():
            if count > 0:
                print(f"    - {col}: {count} missing")
    
    print(f"\n  {result['message']}")
    
    # Cleanup
    os.remove(test_file)
    
    return True

def main():
    print("="*60)
    print("DATA CLEANING FUNCTIONALITY TEST")
    print("="*60)
    print("\nThis test will verify all 7 cleaning strategies:")
    print("1. Drop Rows")
    print("2. Drop Columns")
    print("3. Fill with Mean (numeric)")
    print("4. Fill with Median (numeric)")
    print("5. Fill with Mode")
    print("6. Forward Fill")
    print("7. Fill with Constant")
    
    tests_passed = 0
    tests_total = 7
    
    # Test 1: Drop rows with missing values
    if test_cleaning_strategy("drop_rows"):
        tests_passed += 1
    
    # Test 2: Drop columns with missing values (test on age column)
    if test_cleaning_strategy("drop_columns", columns=["age"]):
        tests_passed += 1
    
    # Test 3: Fill with mean (numeric columns only)
    if test_cleaning_strategy("mean", columns=["age", "income", "score"]):
        tests_passed += 1
    
    # Test 4: Fill with median (numeric columns only)
    if test_cleaning_strategy("median", columns=["age", "income"]):
        tests_passed += 1
    
    # Test 5: Fill with mode (works for all column types)
    if test_cleaning_strategy("mode"):
        tests_passed += 1
    
    # Test 6: Forward fill
    if test_cleaning_strategy("forward_fill"):
        tests_passed += 1
    
    # Test 7: Fill with constant value
    if test_cleaning_strategy("constant", fill_value="0"):
        tests_passed += 1
    
    # Final summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Tests Passed: {tests_passed}/{tests_total}")
    
    if tests_passed == tests_total:
        print("\n✅ ALL TESTS PASSED! Data cleaning is working correctly.")
    else:
        print(f"\n⚠️  {tests_total - tests_passed} test(s) failed. Please check the errors above.")
    
    print("="*60)

if __name__ == "__main__":
    main()
