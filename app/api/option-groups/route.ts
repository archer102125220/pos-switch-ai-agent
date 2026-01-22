import { NextRequest, NextResponse } from 'next/server';
import { OptionGroup, Option } from '@/db/models';
import { withAuth, requirePermission } from '@/utils/auth';
import type { AuthUser } from '@/types/auth';

/**
 * GET /api/option-groups
 * List all option groups with their options
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const optionGroups = await OptionGroup.findAll({
      where,
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'name', 'priceAdjustment', 'isActive', 'sortOrder'],
        },
      ],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    return NextResponse.json({ optionGroups });
  } catch (error) {
    console.error('Get option groups error:', error);
    return NextResponse.json(
      { error: '取得選項群組列表時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/option-groups
 * Create a new option group (requires product_management permission)
 */
export const POST = withAuth(
  async (request: NextRequest, { user }: { user: AuthUser }) => {
    const permError = requirePermission(user, 'product_management');
    if (permError) return permError;

    try {
      const body = await request.json();
      const { name, isRequired, multipleSelection, options } = body;

      // Validate required fields
      if (!name) {
        return NextResponse.json(
          { error: '名稱為必填欄位' },
          { status: 400 }
        );
      }

      // Create option group
      const optionGroup = await OptionGroup.create({
        name,
        isRequired: isRequired ?? false,
        multipleSelection: multipleSelection ?? false,
        isActive: true,
        sortOrder: 0,
      });

      // Create options if provided
      if (Array.isArray(options) && options.length > 0) {
        await Option.bulkCreate(
          options.map((opt: { name: string; priceAdjustment?: number; sortOrder?: number }, index: number) => ({
            optionGroupId: optionGroup.id,
            name: opt.name,
            priceAdjustment: opt.priceAdjustment ?? 0,
            isActive: true,
            sortOrder: opt.sortOrder ?? index,
          }))
        );
      }

      // Fetch created option group with options
      const createdOptionGroup = await OptionGroup.findByPk(optionGroup.id, {
        include: [
          {
            model: Option,
            as: 'options',
            attributes: ['id', 'name', 'priceAdjustment', 'isActive', 'sortOrder'],
          },
        ],
      });

      return NextResponse.json({ optionGroup: createdOptionGroup }, { status: 201 });
    } catch (error) {
      console.error('Create option group error:', error);
      return NextResponse.json(
        { error: '建立選項群組時發生錯誤' },
        { status: 500 }
      );
    }
  }
);
