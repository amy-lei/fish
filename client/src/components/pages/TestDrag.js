import React, { Component } from 'react';

class TestDrag extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [
                {category: "WIP", id: "1"},
                {category: "WIP", id: "2"},
                {category: "completed", id: "3"},
                {category: "completed", id: "4"},
            ]
        };
    }

    onDragStart = (e, taskNum) => {
      console.log(taskNum);
      e.dataTransfer.setData("id", taskNum);
    };

    onDragOver = (e) => {
        e.preventDefault();
    };

    onDrop = (e, cat) => {
        const id = e.dataTransfer.getData("id");

        const tasks = this.state.tasks.filter((task) => {
            if (task.id === id) {
                task.category = cat;
            }
            return task;
        });

        this.setState({ tasks });
    };

    render() {
        const tasks = {
            WIP: [],
            completed: []
        };

        this.state.tasks.forEach((t) => {
            tasks[t.category].push(
                <div key={t.id} draggable style={{'backgroundColor': t.category === "WIP" ? 'lightblue' : 'pink'}}
                    onDragStart={(e) => this.onDragStart(e, t.id)}>
                    I am wip task #{t.id}
                </div>
            )
        });

        return (
            <div>
                <div style={{'float':'left', 'width':'500px', 'height': '500px','border': '1px solid black'}}
                    onDragOver={(e) => this.onDragOver(e)}
                    onDrop={(e) => this.onDrop(e, "WIP")}>
                    WIP
                    <br/>
                    {tasks.WIP}
                </div>
                <div style={{'float':'right', 'width':'500px', 'height': '500px', 'border': '1px solid black'}}
                    onDragOver={(e) => this.onDragOver(e)}
                    onDrop={(e) => this.onDrop(e, "completed")}>
                    Completed
                    <br/>
                    {tasks.completed}
                </div>
            </div>
        )
    }
}

export default TestDrag;