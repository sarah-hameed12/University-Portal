function List({ sock, use, set, scur }) {
  function handle(selectedItem) {
    const updatedUsers = use.map((item) => ({
      ...item,
      ch: item.id === selectedItem.id,
    }));

    set(updatedUsers);

    scur(selectedItem.username);

    sock.emit("pretext", { to: selectedItem.username });
  }

  return (
    <div>
      {use.map((item) => (
        <div
          className={`use ${item.ch ? "active" : ""}`}
          key={item.id}
          onClick={() => handle(item)}
        >
          <input
            type="checkbox"
            checked={item.ch}
            readOnly
            aria-hidden="true"
            tabIndex="-1"
          />
          <div className="user-avatar-placeholder">
            {item.username ? item.username[0] : "?"}
          </div>
          {/* <label>{item.username}</label> */}
          <label>{item.username}</label>
        </div>
      ))}
    </div>
  );
}

export default List;
