// examples.js — DevPulse sample code snippets

const EXAMPLES = {
  bubble: {
    lang: 'Python',
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

data = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(data))`
  },
  api: {
    lang: 'JavaScript',
    code: `function fetchUser(id) {
  var result;
  fetch('https://api.example.com/users/' + id)
    .then(r => r.json())
    .then(data => { result = data; })
  console.log(result);
  return result;
}`
  },
  thread: {
    lang: 'Java',
    code: `public class Counter {
    private int count = 0;

    public void increment() { count++; }

    public static void main(String[] args) throws Exception {
        Counter c = new Counter();
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) c.increment();
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) c.increment();
        });
        t1.start(); t2.start();
        t1.join();  t2.join();
        System.out.println(c.count);
    }
}`
  },
  sql: {
    lang: 'SQL',
    code: `SELECT * FROM orders
WHERE customer_id = 123
AND status = 'pending'
ORDER BY created_at`
  }
};

function load(key) {
  const ex = EXAMPLES[key];
  if (!ex) return;
  document.getElementById('code').value = ex.code;
  document.getElementById('lang').value = ex.lang;
}
