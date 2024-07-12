// Quest.js
export default class Quest {
    constructor(name, description, objectives, reward) {
      this.name = name;
      this.description = description;
      this.objectives = objectives; // อาร์เรย์ของเป้าหมายที่ต้องทำให้สำเร็จ
      this.reward = reward;
      this.isCompleted = false;
      this.rewardGiven = false; // เพิ่มตัวแปรนี้
    }
  
    checkCompletion() {
      // ตรวจสอบว่าเป้าหมายทุกอย่างเสร็จสิ้นหรือไม่
      this.isCompleted = this.objectives.every(objective => objective.isCompleted);
    }
  
    complete() {
      if (this.isCompleted && !this.rewardGiven) {
        this.rewardGiven = true; // ตั้งค่าให้เป็น true หลังจากให้รางวัล
        this.reward();
      }
    }
  
    reset() {
      this.isCompleted = false;
      this.rewardGiven = false;
      this.objectives.forEach(objective => objective.isCompleted = false);
    }
  }
  