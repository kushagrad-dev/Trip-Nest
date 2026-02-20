class ExpressError extends Error{
    constructor(status,message){
        super(message);
        this.status = status;
        this.message = message;

        console.error("EXPRESS ERROR TRIGGERED");
        console.error("Status:", status);
        console.error("Message:", message);
        console.error("Stack:", this.stack);
    }
} 
module.exports = ExpressError;