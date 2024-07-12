// Objective.js
export default class Objective {
    constructor(name, description) {
      this.name = name;
      this.description = description;
      this.isCompleted = false;
    }
  
    complete() {
      this.isCompleted = true;
    }
  }
  