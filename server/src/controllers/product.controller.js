const { supabaseAdmin } = require('../config/supabase');

/**
 * GET /api/products
 * List products with search, multi-filter, sorting, and pagination
 */
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const categoryId = req.query.category_id || '';
    const productType = req.query.product_type || '';
    const status = req.query.status || '';
    const material = req.query.material || '';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? true : false;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('products')
      .select('*, category:categories(id, name, description)', { count: 'exact' });

    // Category Filter
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Product Type Filter
    if (productType) {
      query = query.eq('product_type', productType);
    }

    // Status Filter
    if (status) {
      query = query.eq('status', status);
    }

    // Material Filter
    if (material) {
      query = query.ilike('material', `%${material}%`);
    }

    // Search Filter (product_code, name, part_number, material)
    if (search) {
      query = query.or(
        `product_code.ilike.%${search}%,name.ilike.%${search}%,part_number.ilike.%${search}%,material.ilike.%${search}%`
      );
    }

    // Sorting & Pagination
    query = query.order(sortBy, { ascending: sortOrder }).range(from, to);

    const { data: products, count, error } = await query;

    if (error) {
      console.error('Database error in getProducts:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to retrieve products list.', code: 'DATABASE_ERROR' },
      });
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    res.status(200).json({
      success: true,
      data: products || [],
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('Unhandled error in getProducts:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error while fetching products.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * GET /api/products/:id
 * Get single product profile details by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*, category:categories(id, name, description, status)')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product record not found.', code: 'NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error('Unhandled error in getProductById:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error fetching product details.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * POST /api/products
 * Create a new product record
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      product_code,
      name,
      category_id,
      product_type = 'component',
      unit = 'pcs',
      material,
      part_number,
      revision = 'R0',
      description,
      minimum_stock = 0,
      status = 'active',
    } = req.body;

    // Server-side field validations
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Product name is required.' } });
    }
    if (name.trim().length < 2 || name.trim().length > 150) {
      return res.status(400).json({ success: false, error: { message: 'Product name must be between 2 and 150 characters.' } });
    }

    const validTypes = ['component', 'assembly', 'finished_product', 'raw_material', 'service', 'other', 'motor_part', 'custom'];
    if (!product_type || !validTypes.includes(product_type)) {
      return res.status(400).json({ success: false, error: { message: 'Valid product type selection is required.' } });
    }

    const validStatuses = ['active', 'inactive', 'discontinued'];
    const sanitizedStatus = validStatuses.includes(status) ? status : 'active';

    // Verify Category ID if provided
    if (category_id) {
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .single();

      if (!category) {
        return res.status(400).json({ success: false, error: { message: 'Selected category does not exist.' } });
      }
    }

    // Generate product_code if not manually provided
    let finalCode = product_code ? product_code.trim().toUpperCase() : null;

    if (!finalCode) {
      const { data: codeData, error: codeErr } = await supabaseAdmin.rpc('generate_next_product_code');
      if (!codeErr && codeData) {
        finalCode = codeData;
      } else {
        // Fallback random code if RPC fails
        finalCode = `PRD-${Math.floor(100000 + Math.random() * 900000)}`;
      }
    } else {
      // Check duplicate code
      const { data: duplicateCode } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('product_code', finalCode)
        .single();

      if (duplicateCode) {
        return res.status(400).json({ success: false, error: { message: `Product code '${finalCode}' already exists.` } });
      }
    }

    const insertPayload = {
      product_code: finalCode,
      name: name.trim(),
      category_id: category_id || null,
      product_type,
      unit: unit ? unit.trim().toLowerCase() : 'pcs',
      material: material ? material.trim() : null,
      part_number: part_number ? part_number.trim() : null,
      revision: revision ? revision.trim() : 'R0',
      description: description ? description.trim() : null,
      minimum_stock: parseFloat(minimum_stock) || 0,
      status: sanitizedStatus,
      created_by: req.user ? req.user.id : null,
    };

    const { data: createdProduct, error: insertError } = await supabaseAdmin
      .from('products')
      .insert(insertPayload)
      .select('*, category:categories(id, name)')
      .single();

    if (insertError) {
      console.error('Error inserting product:', insertError);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to create product record.', code: 'DATABASE_ERROR' },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product master record created successfully.',
      data: createdProduct,
    });
  } catch (err) {
    console.error('Unhandled error in createProduct:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error creating product.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * PATCH /api/products/:id
 * Update product information
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category_id,
      product_type,
      unit,
      material,
      part_number,
      revision,
      description,
      minimum_stock,
      status,
    } = req.body;

    const { data: existing, error: findErr } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (findErr || !existing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product record not found.', code: 'NOT_FOUND' },
      });
    }

    if (name && (!name.trim() || name.trim().length < 2 || name.trim().length > 150)) {
      return res.status(400).json({ success: false, error: { message: 'Product name must be between 2 and 150 characters.' } });
    }

    if (category_id) {
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .single();

      if (!category) {
        return res.status(400).json({ success: false, error: { message: 'Selected category does not exist.' } });
      }
    }

    const updatePayload = {
      ...(name && { name: name.trim() }),
      ...(category_id !== undefined && { category_id: category_id || null }),
      ...(product_type && { product_type }),
      ...(unit && { unit: unit.trim().toLowerCase() }),
      ...(material !== undefined && { material: material ? material.trim() : null }),
      ...(part_number !== undefined && { part_number: part_number ? part_number.trim() : null }),
      ...(revision !== undefined && { revision: revision ? revision.trim() : 'R0' }),
      ...(description !== undefined && { description: description ? description.trim() : null }),
      ...(minimum_stock !== undefined && { minimum_stock: parseFloat(minimum_stock) || 0 }),
      ...(status && ['active', 'inactive', 'discontinued'].includes(status) && { status }),
      updated_by: req.user ? req.user.id : null,
    };

    const { data: updatedProduct, error: updateErr } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select('*, category:categories(id, name)')
      .single();

    if (updateErr) {
      console.error('Error updating product:', updateErr);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to update product record.', code: 'DATABASE_ERROR' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product record updated successfully.',
      data: updatedProduct,
    });
  } catch (err) {
    console.error('Unhandled error in updateProduct:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error updating product.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * PATCH /api/products/:id/status
 * Activate / Deactivate product status
 */
exports.patchProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'discontinued'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid status value (active, inactive, discontinued) is required.' },
      });
    }

    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update({ status, updated_by: req.user ? req.user.id : null })
      .eq('id', id)
      .select('id, product_code, name, status')
      .single();

    if (error || !updatedProduct) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found or status update failed.', code: 'NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      message: `Product status updated to ${status}.`,
      data: updatedProduct,
    });
  } catch (err) {
    console.error('Unhandled error in patchProductStatus:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error updating product status.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

// ==============================================================================
// PRODUCT CATEGORY CONTROLLERS
// ==============================================================================

/**
 * GET /api/product-categories
 * List product categories with product count per category
 */
exports.getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*, products(id)')
      .order('name', { ascending: true });

    if (error) {
      console.error('Database error in getCategories:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to retrieve product categories.', code: 'DATABASE_ERROR' },
      });
    }

    // Map categories and compute real product_count
    const mappedCategories = (categories || []).map((cat) => {
      const productCount = Array.isArray(cat.products) ? cat.products.length : 0;
      const { products, ...catFields } = cat;
      return {
        ...catFields,
        product_count: productCount,
      };
    });

    res.status(200).json({
      success: true,
      data: mappedCategories,
    });
  } catch (err) {
    console.error('Unhandled error in getCategories:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error fetching categories.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * POST /api/product-categories
 * Create a new product category
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status = 'active' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Category name is required.' } });
    }

    // Check duplicate name
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id')
      .ilike('name', name.trim())
      .single();

    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'A category with this name already exists.' } });
    }

    const newCategoryPayload = {
      name: name.trim(),
      description: description ? description.trim() : null,
      status: status === 'inactive' ? 'inactive' : 'active',
      created_by: req.user ? req.user.id : null,
    };

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert(newCategoryPayload)
      .select()
      .single();

    if (error) {
      console.error('Error inserting category:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to create category record.', code: 'DATABASE_ERROR' },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product category created successfully.',
      data: category,
    });
  } catch (err) {
    console.error('Unhandled error in createCategory:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error creating category.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * PATCH /api/product-categories/:id
 * Update product category
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const { data: existing, error: findErr } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .eq('id', id)
      .single();

    if (findErr || !existing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Category record not found.', code: 'NOT_FOUND' },
      });
    }

    if (name && name.trim() !== existing.name) {
      const { data: duplicate } = await supabaseAdmin
        .from('categories')
        .select('id')
        .ilike('name', name.trim())
        .neq('id', id)
        .single();

      if (duplicate) {
        return res.status(400).json({ success: false, error: { message: 'Another category with this name already exists.' } });
      }
    }

    const updatePayload = {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description ? description.trim() : null }),
      ...(status && ['active', 'inactive'].includes(status) && { status }),
      updated_by: req.user ? req.user.id : null,
    };

    const { data: category, error: updateErr } = await supabaseAdmin
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      console.error('Error updating category:', updateErr);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to update category record.', code: 'DATABASE_ERROR' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: category,
    });
  } catch (err) {
    console.error('Unhandled error in updateCategory:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error updating category.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};

/**
 * PATCH /api/product-categories/:id/status
 * Activate / Deactivate product category (checks active product dependencies)
 */
exports.patchCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid status value (active, inactive) is required.' },
      });
    }

    // Safety check when deactivating: check if active products are assigned to this category
    if (status === 'inactive') {
      const { count: activeProductCount, error: countErr } = await supabaseAdmin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id)
        .eq('status', 'active');

      if (!countErr && activeProductCount > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Category cannot be deactivated while ${activeProductCount} active product(s) are assigned to it. Please reassign or deactivate dependent products first.`,
            code: 'DEPENDENT_PRODUCTS_EXIST',
          },
        });
      }
    }

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update({ status, updated_by: req.user ? req.user.id : null })
      .eq('id', id)
      .select('id, name, status')
      .single();

    if (error || !category) {
      return res.status(404).json({
        success: false,
        error: { message: 'Category not found or status update failed.', code: 'NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      message: `Category status updated to ${status}.`,
      data: category,
    });
  } catch (err) {
    console.error('Unhandled error in patchCategoryStatus:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error updating category status.', code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};
