import { NextRequest, NextResponse } from 'next/server';
import { OptionGroup, Option } from '@/db/models';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/option-groups/[id]
 * Get option group details with options
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const optionGroupId = parseInt(id, 10);

    if (isNaN(optionGroupId)) {
      return NextResponse.json(
        { error: '無效的選項群組 ID' },
        { status: 400 }
      );
    }

    const optionGroup = await OptionGroup.findByPk(optionGroupId, {
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'name', 'priceAdjustment', 'isActive', 'sortOrder'],
        },
      ],
    });

    if (!optionGroup) {
      return NextResponse.json(
        { error: '選項群組不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ optionGroup });
  } catch (error) {
    console.error('Get option group error:', error);
    return NextResponse.json(
      { error: '取得選項群組時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/option-groups/[id]
 * Update option group (requires product_management permission)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { requireAuth, requirePermission: reqPerm } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = reqPerm(auth.user!, 'product_management');
  if (permError) return permError;

  try {
    const { id } = await params;
    const optionGroupId = parseInt(id, 10);

    if (isNaN(optionGroupId)) {
      return NextResponse.json(
        { error: '無效的選項群組 ID' },
        { status: 400 }
      );
    }

    const optionGroup = await OptionGroup.findByPk(optionGroupId);
    if (!optionGroup) {
      return NextResponse.json(
        { error: '選項群組不存在' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, isRequired, multipleSelection, isActive, sortOrder, options } = body;

    // Update option group
    await optionGroup.update({
      ...(name !== undefined && { name }),
      ...(isRequired !== undefined && { isRequired }),
      ...(multipleSelection !== undefined && { multipleSelection }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    // Update options if provided
    if (Array.isArray(options)) {
      // Delete all existing options
      await Option.destroy({ where: { optionGroupId } });
      
      // Create new options
      if (options.length > 0) {
        await Option.bulkCreate(
          options.map((opt: { id?: number; name: string; priceAdjustment?: number; isActive?: boolean; sortOrder?: number }, index: number) => ({
            optionGroupId,
            name: opt.name,
            priceAdjustment: opt.priceAdjustment ?? 0,
            isActive: opt.isActive ?? true,
            sortOrder: opt.sortOrder ?? index,
          }))
        );
      }
    }

    // Fetch updated option group with options
    const updatedOptionGroup = await OptionGroup.findByPk(optionGroupId, {
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'name', 'priceAdjustment', 'isActive', 'sortOrder'],
        },
      ],
    });

    return NextResponse.json({ optionGroup: updatedOptionGroup });
  } catch (error) {
    console.error('Update option group error:', error);
    return NextResponse.json(
      { error: '更新選項群組時發生錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/option-groups/[id]
 * Delete option group (requires product_management permission)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { requireAuth, requirePermission: reqPerm } = await import('@/utils/auth');
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  
  const permError = reqPerm(auth.user!, 'product_management');
  if (permError) return permError;

  try {
    const { id } = await params;
    const optionGroupId = parseInt(id, 10);

    if (isNaN(optionGroupId)) {
      return NextResponse.json(
        { error: '無效的選項群組 ID' },
        { status: 400 }
      );
    }

    const optionGroup = await OptionGroup.findByPk(optionGroupId);
    if (!optionGroup) {
      return NextResponse.json(
        { error: '選項群組不存在' },
        { status: 404 }
      );
    }

    // Delete associated options first (cascade delete)
    await Option.destroy({ where: { optionGroupId } });
    
    // Delete option group
    await optionGroup.destroy();

    return NextResponse.json({ message: '選項群組已刪除' });
  } catch (error) {
    console.error('Delete option group error:', error);
    return NextResponse.json(
      { error: '刪除選項群組時發生錯誤' },
      { status: 500 }
    );
  }
}
