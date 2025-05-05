import { useEffect } from "react";

function Users({ sock, use, set }) {
  useEffect(() => {
    const handleusers = (data) => {
      var n_temp = {
        username: data,
        id: Math.floor(Math.random() * 10000000 + 1),
        ch: false,
      };
      set((p_use) => {
        var p_t = [];
        console.log(`${p_use}, this`);
        for (let i = 0; i < p_use.length; i++) {
          console.log(p_use[i].username);
          p_t = [...p_t, p_use[i].username];
        }
        console.log(p_t);
        console.log(n_temp.username);
        console.log(p_t.includes(n_temp.username));
        if (p_t.includes(n_temp.username)) {
          return p_use;
        } else {
          return [...p_use, n_temp];
        }
      });
    };

    sock.on("user", handleusers);

    return () => {
      sock.off("user", handleusers);
    };
  }, [sock]);
}

export default Users;
