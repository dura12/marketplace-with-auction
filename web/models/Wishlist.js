import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true, 
        unique: true,
        validate: {
          validator: function(v) {
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
          },
          message: props => `${props.value} is not a valid email!`
        }},
    products:[{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }]
});
const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;