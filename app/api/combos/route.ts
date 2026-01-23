import { NextRequest, NextResponse } from 'next/server';
import { Combo, ComboGroup, ComboGroupItem, Category, Product } from '@/db/models';

/**
 * GET /api/combos
 * List all combos with their groups and items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const whereClause = includeInactive ? {} : { isActive: true };

    const combos = await Combo.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ComboGroup,
          as: 'groups',
          include: [
            {
              model: ComboGroupItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'price', 'imageUrl'],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
        [{ model: ComboGroup, as: 'groups' }, 'sortOrder', 'ASC'],
        [{ model: ComboGroup, as: 'groups' }, { model: ComboGroupItem, as: 'items' }, 'sortOrder', 'ASC'],
      ],
    });

    return NextResponse.json({ combos });
  } catch (error) {
    console.error('Get combos error:', error);
    return NextResponse.json(
      { error: '取得套餐列表失敗' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/combos
 * Create a new combo with groups and items
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, categoryId, price, originalPrice, imageUrl, sortOrder, isActive, groups } = body;

    // Validate required fields
    if (!name || price === undefined) {
      return NextResponse.json(
        { error: '名稱和價格為必填欄位' },
        { status: 400 }
      );
    }

    // Create combo
    const combo = await Combo.create({
      name,
      description: description || null,
      categoryId: categoryId || null,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      imageUrl: imageUrl || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    });

    // Create groups and items if provided
    if (groups && Array.isArray(groups)) {
      for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const groupData = groups[groupIndex];
        
        const comboGroup = await ComboGroup.create({
          comboId: combo.id,
          name: groupData.name,
          description: groupData.description || null,
          selectionType: groupData.selectionType || 'single',
          minSelections: groupData.minSelections ?? 1,
          maxSelections: groupData.maxSelections ?? 1,
          isRequired: groupData.isRequired ?? true,
          sortOrder: groupData.sortOrder ?? groupIndex,
        });

        // Create items for this group
        if (groupData.items && Array.isArray(groupData.items)) {
          for (let itemIndex = 0; itemIndex < groupData.items.length; itemIndex++) {
            const itemData = groupData.items[itemIndex];
            
            await ComboGroupItem.create({
              comboGroupId: comboGroup.id,
              productId: itemData.productId,
              priceAdjustment: itemData.priceAdjustment ?? 0,
              isDefault: itemData.isDefault ?? false,
              sortOrder: itemData.sortOrder ?? itemIndex,
            });
          }
        }
      }
    }

    // Fetch the complete combo with associations
    const createdCombo = await Combo.findByPk(combo.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ComboGroup,
          as: 'groups',
          include: [
            {
              model: ComboGroupItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'price', 'imageUrl'],
                },
              ],
            },
          ],
        },
      ],
    });

    return NextResponse.json(
      { combo: createdCombo, message: '套餐建立成功' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create combo error:', error);
    return NextResponse.json(
      { error: '建立套餐失敗' },
      { status: 500 }
    );
  }
}
