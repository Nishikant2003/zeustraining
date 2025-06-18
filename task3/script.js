const DIVISOR=10;
function timeSeconds(){
    return new Date().getTime() / 1000;
}
function factorial(n) {
        var seconds1 = timeSeconds()
        let result = [1];
        
        for (let i = 2; i <= n; i++) {
            let carry = 0;
            
            for (let j = 0; j < result.length; j++) {
                let product = result[j] * i + carry;
                result[j] = product % DIVISOR;
                carry = Math.floor(product / DIVISOR);
            }
            while (carry > 0) {
                result.push(carry % DIVISOR);
                carry = Math.floor(carry / DIVISOR);
            }
        }
        console.log(`time taken: ${timeSeconds()-seconds1}`)
        return result;
    }

    function calculateFactorial() {
        let number = document.getElementById('num').value;
        let result = factorial(number);
        let resultStr = result.reverse().join('');
        document.getElementById('result').textContent = resultStr;
    }
    