import { types } from 'mobx-state-tree';

export const ItemModel = types.model('Item', {
  id: types.identifier,
  name: types.string,
  description: types.string,
  count: types.number,
});

export const StoreModel = types.model('Store', {
  items: types.array(ItemModel),
}).actions(self => ({
  addItem(item) {
    self.items.push(item);
  },
  updateItemName(id, name) {
    const item = self.items.find(i => i.id === id);
    if (item) {
      item.name = name;
    }
  }
}));

export const store = StoreModel.create({
  items: [
    { id: '1', name: 'First Item', description: 'This is the first item', count: 1 },
    { id: '2', name: 'Second Item', description: 'This is the second item', count: 2 },
  ]
});
