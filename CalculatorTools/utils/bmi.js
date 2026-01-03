import axios from "axios";

const apiVerseBmiUrl = 'https://api.apiverve.com/v1/bmicalculator';

export async function calculateBmiUsingApiVerse(key,height,weight){
    if(!key){
        throw new Error("API key is required");
    }

    try{

    const res = await axios.get(apiVerseBmiUrl, {
        headers: {
            'x-api-key': key
        },
        params: {
            height,
            weight
        }
    });

        return res.data;
    }catch(err){
        throw new Error(err);
    }

   

} 