export class Trip {
  constructor() {
    this.locations = [];
    this.packagingList = [];
  }

  setPackagingList(list) {
    this.packagingList = [...list];
  }

  addLocation(location) {
    this.locations.push(location);
  }
}
