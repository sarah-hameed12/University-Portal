// //import { useState } from "react";


// function List({sock, use, set, cur, scur}){
//     //const elem = {name: "sarfraz", age: 8, id: 1, ch: true}
//     //const elem2 = {name: "ahmed", age: 9, id: 2, ch: true}
//     //const arr = [elem, elem2]
//     //const [items, set_item] = useState(arr)

//     function handle(item1){
//         const n_items = use.map((item) => { 
//             return item.id === item1.id? {...item, ch: !item.ch
//             } : {...item, ch: false}
//         })
//         set(n_items)
//         //console.log(item1.username)
//         //console.log(scur)
//         scur(item1.username)
//         //console.log(item1.username)
//         sock.emit("pretext", {to: item1.username})
//     }
//     return (
//         <div>
//             {use.map((item) =>(
//                 <div className="use" key = {item.id} onDoubleClick={()=> handle(item)}>
//                     <input type = "checkbox" checked = {item.ch} onChange={()=> handle(item)}/>
//                     <label>{item.username}</label>
//                 </div>
//             ) )}
//         </div>
//     )
// }

// export default List


// src/List.js
// No useState needed here if all state is managed by App.js

function List({ sock, use, set, scur /* cur prop is not used here */ }) {

    // Function to handle user selection
    function handle(selectedItem) {
        // Create the new users array where only the selectedItem is active
        const updatedUsers = use.map((item) => ({
            ...item, // Keep existing properties
            ch: item.id === selectedItem.id // Set 'ch' to true only if IDs match
        }));

        // Update the user list state in the parent (App.js)
        set(updatedUsers);

        // Update the currently selected conversation partner in the parent (App.js)
        scur(selectedItem.username);

        // Emit an event (e.g., to fetch message history for this user)
        // console.log(`Emitting pretext for: ${selectedItem.username}`); // For debugging
        sock.emit("pretext", { to: selectedItem.username });
    }

    return (
        // This outer div is optional if .users in App.js provides enough structure
        // Using React.Fragment if no extra div is needed: <> ... </>
        <div>
            {/* Map over the users array received via props */}
            {use.map((item) => (
                <div
                    // Apply 'use' class always, and 'active' class if item.ch is true
                    className={`use ${item.ch ? 'active' : ''}`}
                    key={item.id} // React key for list items
                    onClick={() => handle(item)} // Handle selection on click
                >
                    {/* Checkbox: Visually hidden by CSS, but semantically present. */}
                    {/* Its state reflects item.ch. readOnly prevents direct interaction */}
                    {/* if the click handler is sufficient on the parent div. */}
                    <input
                        type="checkbox"
                        checked={item.ch}
                        readOnly
                        // You could add an onChange={...} here as well if needed,
                        // but onClick on the div usually covers it.
                        aria-hidden="true" // Hide from accessibility tree as it's controlled elsewhere
                        tabIndex="-1"      // Prevent tabbing to it
                    />
                    {/* Label displays the username. CSS makes this part of the clickable area. */}
                    <label>
                        {item.username}
                    </label>
                </div>
            ))}
        </div>
    );
}

export default List;