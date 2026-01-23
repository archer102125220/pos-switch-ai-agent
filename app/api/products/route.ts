import { NextRequest, NextResponse } from 'next/server';
import { Product, Category, OptionGroup, Option, Addon } from '@/db/models';
import { withAuth, requirePermission } from '@/utils/auth';
import { type AuthUser } from '@/types/auth';

/**
 * GET /api/products
 * List all products (public or authenticated)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const products = await Product.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: OptionGroup,
          as: 'optionGroups',
          attributes: ['id', 'name', 'isRequired', 'multipleSelection'],
          through: { attributes: [] }, // Exclude junction table fields
          include: [
            {
              model: Option,
              as: 'options',
              attributes: ['id', 'name', 'priceAdjustment', 'sortOrder'],
            },
          ],
        },
        {
          model: Addon,
          as: 'addons',
          attributes: ['id', 'name', 'price', 'stock', 'trackStock', 'isActive'],
          through: { attributes: [] }, // Exclude junction table fields
        },
      ],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: '取得商品列表時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product (requires product_management permission)
 */
export const POST = withAuth(
  async (request: NextRequest, { user }: { user: AuthUser }) => {
    // Check permission
    const permError = requirePermission(user, 'product_management');
    if (permError) return permError;

    try {
      const body = await request.json();
      const { categoryId, name, description, price, sku, barcode, imageUrl, stock, trackStock, sortOrder } = body;

      // Validate required fields
      if (!categoryId || !name || price === undefined) {
        return NextResponse.json(
          { error: '分類、名稱和價格為必填欄位' },
          { status: 400 }
        );
      }

      // Check if category exists
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return NextResponse.json(
          { error: '指定的分類不存在' },
          { status: 400 }
        );
      }

      const product = await Product.create({
        categoryId,
        name,
        description: description || null,
        price,
        sku: sku || null,
        barcode: barcode || null,
        imageUrl: imageUrl || null,
        stock: stock ?? null,
        trackStock: trackStock ?? false,
        sortOrder: sortOrder ?? 0,
        isActive: true,
      });

      return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
      console.error('Create product error:', error);
      return NextResponse.json(
        { error: '建立商品時發生錯誤' },
        { status: 500 }
      );
    }
  }
);
