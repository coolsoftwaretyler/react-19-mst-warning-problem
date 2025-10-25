import React from "react";
import { useLocalObservable, observer } from "mobx-react-lite";
import { types, flow } from "mobx-state-tree";

export const AppContext = React.createContext(null);

const Item = types.model("Item", {
  id: types.identifier,
  name: types.string,
});

const Root = types
  .model("Root", {
    item: types.maybeNull(Item),
  })
  .actions((self) => ({
    updateItem: flow(function* (newValue) {
      self.item = newValue;
    }),
  }));


const Comp = observer(({ item }) => {
  return <div style={{ background: "lightblue" }}>Hello {item?.name}</div>;
});

export default observer(function App() {
  const store = useLocalObservable(() => {
    return Root.create({ item: { id: "1", name: "initial" } });
  });
  return (
    <AppContext.Provider value={store}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          store.updateItem({
            id: Math.round(Math.random() * 100).toString(),
            name: `item${Math.random()}`,
          });
        }}
      >
        Update
      </button>
      <Comp item={store.item} />
    </AppContext.Provider>
  );
});
