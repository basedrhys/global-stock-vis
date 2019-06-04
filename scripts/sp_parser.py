import argparse
import csv
from alpha_vantage.timeseries import TimeSeries
import os
import urllib
import time

API_KEY ='PUT_ALPHA_VANTAGE_KEY_HERE'
QUERY = "https://www.alphavantage.co/query?function={}&apikey={}&symbol={}"


# Get json object with the intraday data and another with  the call's metadata
# data, meta_data = ts.get_intraday('GOOGL')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('-i', '--input', help="inputfile", type=str)
    args=parser.parse_args()
    with open(args.input) as csvfile:
        reader = csv.DictReader(csvfile)
        # API only supports 5 calls per minute
        i = 0
        checkpoint = False
        for row in reader:
            if checkpoint == False:
                if 'CTAS' not in row['Symbol']:
                    print(row['Symbol'])
                    continue
                else:
                    checkpoint = True
            with urllib.request.urlopen(QUERY.format('TIME_SERIES_MONTHLY',
                                                     API_KEY,
                                                     row['Symbol'])) as request:
                data=request.read().decode("utf-8")
                print(data)
            i+=1
            if i % 5 == 0:
                time.sleep(65)

if __name__ == '__main__':
    main()
