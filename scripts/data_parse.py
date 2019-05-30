import json
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input', type=str)
    args=parser.parse_args()

    data = None

    print('{},{},{},{}'.format('SYMBOL', 'MONTH', 'CLOSE', 'VOLUME'))

    with open(args.input, 'r') as f:
        data = json.loads(f.read())

    for item in data:
        key = None
        close = None
        volume = None
        for i in item['Monthly Time Series'].keys():
            print('{},{},{},{}'.format(item['Meta Data']['2. Symbol'], i[:-3], item['Monthly Time Series'][i]['4. close'], item['Monthly Time Series'][i]['5. volume']))

if __name__ == '__main__':
    main()
