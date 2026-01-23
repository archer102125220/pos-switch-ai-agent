import { NextRequest, NextResponse } from 'next/server';
import { Combo, ComboGroup, ComboGroupItem, Category, Product } from '@/db/models';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/combos/[id]
 * Get a single combo with all details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const comboId = parseInt(id, 10);

    if (isNaN(comboId)) {
      return NextResponse.json(
        { error: '無效的套餐 ID' },
        { status: 400 }
      );
    }

    const combo = await Combo.findByPk(comboId, {
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
          order: [['sortOrder', 'ASC']],
        },
      ],
    });

    if (!combo) {
      return NextResponse.json(
        { error: '找不到該套餐' },
        { status: 404 }
      );
    }

    return NextResponse.json({ combo });
  } catch (error) {
    console.error('Get combo error:', error);
    return NextResponse.json(
      { error: '取得套餐失敗' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/combos/[id]
 * Update a combo with its groups and items
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const comboId = parseInt(id, 10);

    if (isNaN(comboId)) {
      return NextResponse.json(
        { error: '無效的套餐 ID' },
        { status: 400 }
      );
    }

    const combo = await Combo.findByPk(comboId);

    if (!combo) {
      return NextResponse.json(
        { error: '找不到該套餐' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, categoryId, price, originalPrice, imageUrl, sortOrder, isActive, groups } = body;

    // Update combo basic info
    await combo.update({
      name: name ?? combo.name,
      description: description !== undefined ? description : combo.description,
      categoryId: categoryId !== undefined ? categoryId : combo.categoryId,
      price: price !== undefined ? Number(price) : combo.price,
      originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : combo.originalPrice,
      imageUrl: imageUrl !== undefined ? imageUrl : combo.imageUrl,
      sortOrder: sortOrder !== undefined ? sortOrder : combo.sortOrder,
      isActive: isActive !== undefined ? isActive : combo.isActive,
    });

    // Update groups if provided
    if (groups !== undefined && Array.isArray(groups)) {
      // Get existing groups
      const existingGroups = await ComboGroup.findAll({
        where: { comboId: combo.id },
      });
      const existingGroupIds = existingGroups.map(g => g.id);

      // Track which groups to keep
      const updatedGroupIds: number[] = [];

      for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        const groupData = groups[groupIndex];

        if (groupData.id) {
          // Update existing group
          const existingGroup = existingGroups.find(g => g.id === groupData.id);
          if (existingGroup) {
            await existingGroup.update({
              name: groupData.name ?? existingGroup.name,
              description: groupData.description !== undefined ? groupData.description : existingGroup.description,
              selectionType: groupData.selectionType ?? existingGroup.selectionType,
              minSelections: groupData.minSelections ?? existingGroup.minSelections,
              maxSelections: groupData.maxSelections ?? existingGroup.maxSelections,
              isRequired: groupData.isRequired ?? existingGroup.isRequired,
              sortOrder: groupData.sortOrder ?? groupIndex,
            });
            updatedGroupIds.push(existingGroup.id);

            // Update items for this group
            if (groupData.items !== undefined && Array.isArray(groupData.items)) {
              // Delete existing items and recreate
              await ComboGroupItem.destroy({ where: { comboGroupId: existingGroup.id } });
              
              for (let itemIndex = 0; itemIndex < groupData.items.length; itemIndex++) {
                const itemData = groupData.items[itemIndex];
                await ComboGroupItem.create({
                  comboGroupId: existingGroup.id,
                  productId: itemData.productId,
                  priceAdjustment: itemData.priceAdjustment ?? 0,
                  isDefault: itemData.isDefault ?? false,
                  sortOrder: itemData.sortOrder ?? itemIndex,
                });
              }
            }
          }
        } else {
          // Create new group
          const newGroup = await ComboGroup.create({
            comboId: combo.id,
            name: groupData.name,
            description: groupData.description || null,
            selectionType: groupData.selectionType || 'single',
            minSelections: groupData.minSelections ?? 1,
            maxSelections: groupData.maxSelections ?? 1,
            isRequired: groupData.isRequired ?? true,
            sortOrder: groupData.sortOrder ?? groupIndex,
          });
          updatedGroupIds.push(newGroup.id);

          // Create items for new group
          if (groupData.items && Array.isArray(groupData.items)) {
            for (let itemIndex = 0; itemIndex < groupData.items.length; itemIndex++) {
              const itemData = groupData.items[itemIndex];
              await ComboGroupItem.create({
                comboGroupId: newGroup.id,
                productId: itemData.productId,
                priceAdjustment: itemData.priceAdjustment ?? 0,
                isDefault: itemData.isDefault ?? false,
                sortOrder: itemData.sortOrder ?? itemIndex,
              });
            }
          }
        }
      }

      // Delete groups that were not included in the update
      const groupsToDelete = existingGroupIds.filter(id => !updatedGroupIds.includes(id));
      for (const groupId of groupsToDelete) {
        await ComboGroupItem.destroy({ where: { comboGroupId: groupId } });
        await ComboGroup.destroy({ where: { id: groupId } });
      }
    }

    // Fetch updated combo
    const updatedCombo = await Combo.findByPk(comboId, {
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

    return NextResponse.json({ combo: updatedCombo, message: '套餐更新成功' });
  } catch (error) {
    console.error('Update combo error:', error);
    return NextResponse.json(
      { error: '更新套餐失敗' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/combos/[id]
 * Delete a combo and all its groups/items
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const comboId = parseInt(id, 10);

    if (isNaN(comboId)) {
      return NextResponse.json(
        { error: '無效的套餐 ID' },
        { status: 400 }
      );
    }

    const combo = await Combo.findByPk(comboId);

    if (!combo) {
      return NextResponse.json(
        { error: '找不到該套餐' },
        { status: 404 }
      );
    }

    // Delete all items in all groups of this combo
    const groups = await ComboGroup.findAll({ where: { comboId } });
    for (const group of groups) {
      await ComboGroupItem.destroy({ where: { comboGroupId: group.id } });
    }

    // Delete all groups
    await ComboGroup.destroy({ where: { comboId } });

    // Delete the combo
    await combo.destroy();

    return NextResponse.json({ message: '套餐已刪除' });
  } catch (error) {
    console.error('Delete combo error:', error);
    return NextResponse.json(
      { error: '刪除套餐失敗' },
      { status: 500 }
    );
  }
}
