import requests
import urllib.parse
import json
import csv
import pandas as pd
from time import sleep

google_key = 'PUT_GOOGLE_KEY_HERE'
base_url = 'https://maps.googleapis.com/maps/api/geocode/json?'
wiki_df = pd.read_csv('project\data\wiki_table.csv')
const_df = pd.read_csv('project\data\constituents_csv.csv')


with open('project/data/stocks/stocks_locations.csv', mode='w+', newline='') as open_file:
  csv_writer = csv.writer(open_file)

  csv_writer.writerow([
    'symbol',
    'location',
    'latitude',
    'longitude',
    "in_both"
  ])

  for index, row in wiki_df.iterrows():
    symbol = row['Symbol']
    loc = row['Headquarters Location']

    # Is the stock data in the initial list of stocks we're collecting
    in_both = symbol in const_df['Symbol'].values

    # Send the request
    request_url = base_url + 'address=' + urllib.parse.quote_plus(loc) + '&key=' + google_key

    # Send the response and parse out the useful info
    response = requests.get(request_url)
    res = response.json()
    loc_data = res['results'][0]['geometry']['location']

    latitude = loc_data['lat']
    longitude = loc_data['lng']

    # Write it out to the file
    csv_writer.writerow([
      symbol,
      loc,
      latitude,
      longitude,
      in_both
    ])

    # Status update
    print(symbol, index)

    # Avoid the rate limit
    sleep(0.5)