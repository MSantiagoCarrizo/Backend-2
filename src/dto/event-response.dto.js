export class EventResponseDTO {
    constructor(event) {
        this.id = event._id;
        this.title = event.title;
        this.description = event.description;
        this.date = event.date;
        this.location = event.location;
        this.capacity = event.capacity;
        this.price = event.price;
        this.status = event.status;

        this.category = event.category?.name
            ? {
                  id: event.category._id,
                  name: event.category.name,
                  description: event.category.description
              }
            : event.category;

        this.organizer = event.organizer?.first_name
            ? {
                  id: event.organizer._id,
                  first_name: event.organizer.first_name,
                  last_name: event.organizer.last_name,
                  email: event.organizer.email
              }
            : event.organizer;
    }
}