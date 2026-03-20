import { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function ProductForm({ product, onSave, onCancel, renderButtons }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    barcode: '',
    cost_price: '',
    selling_price: '',
    current_stock: 0,
    low_stock_threshold: 5,
    unit: 'pieces'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.cost_price || parseFloat(formData.cost_price) < 0) {
      newErrors.cost_price = 'Valid cost price is required';
    }

    if (!formData.selling_price || parseFloat(formData.selling_price) < 0) {
      newErrors.selling_price = 'Valid selling price is required';
    }

    if (parseFloat(formData.selling_price) < parseFloat(formData.cost_price)) {
      newErrors.selling_price = 'Selling price should be higher than cost price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const dataToSave = {
      ...formData,
      cost_price: parseFloat(formData.cost_price),
      selling_price: parseFloat(formData.selling_price),
      current_stock: parseInt(formData.current_stock) || 0,
      low_stock_threshold: parseInt(formData.low_stock_threshold) || 5
    };

    onSave(dataToSave);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Enter product name"
        required
        error={errors.name}
      />

      <Input
        label="Category"
        value={formData.category}
        onChange={(e) => handleChange('category', e.target.value)}
        placeholder="e.g., Electronics, Food, etc."
      />

      <Input
        label="Barcode / SKU"
        value={formData.barcode}
        onChange={(e) => handleChange('barcode', e.target.value)}
        placeholder="Optional"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Cost Price"
          type="number"
          value={formData.cost_price}
          onChange={(e) => handleChange('cost_price', e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          error={errors.cost_price}
        />

        <Input
          label="Selling Price"
          type="number"
          value={formData.selling_price}
          onChange={(e) => handleChange('selling_price', e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          error={errors.selling_price}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Initial Stock"
          type="number"
          value={formData.current_stock}
          onChange={(e) => handleChange('current_stock', e.target.value)}
          placeholder="0"
          min="0"
          disabled={!!product}
        />

        <Input
          label="Low Stock Alert"
          type="number"
          value={formData.low_stock_threshold}
          onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
          placeholder="5"
          min="0"
        />
      </div>

      <Input
        label="Unit"
        value={formData.unit}
        onChange={(e) => handleChange('unit', e.target.value)}
        placeholder="pieces, kg, liters, etc."
      />

      {!renderButtons && (
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            {product ? 'Update' : 'Add'} Product
          </Button>
        </div>
      )}

      {/* Hidden submit button so form can be submitted from external footer */}
      {renderButtons && <button type="submit" id="product-form-submit" className="hidden" />}
    </form>
  );
}
