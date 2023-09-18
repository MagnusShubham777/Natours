
import axios from "axios";
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51NqvXUSIayE5uQn9git4xMUi0Q4rNH85Zyk5gFIJ06LHIhcX2b4UxknWgEHSWksHFv6iv3IBGb2BlPbnsc9XbkiG00mLIYurVS')


export const bookTour = async tourId => {
    //1) GET checkout session from API
    try {
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkoutSessions/${tourId}`);
        //console.log(session);
        //2)Create Checkout form+chanre creadit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (err) {
        showAlert('error', err);
    }
}