import argparse
import csv

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('-i', '--input', type=str)
    parser.add_argument("-l", "--list", type=str)
    parser.add_argument('-L', '--locations', type=str)
    args=parser.parse_args()

    loc_csv = open(args.locations)
    loc_dict = {}
    loc_reader = csv.DictReader(loc_csv)
    for loc_row in loc_reader:
        loc_dict['{}'.format(loc_row['symbol'])] = {'lat':loc_row['latitude'],
                                                    'long':loc_row['longitude']
                                                   }                                                 
    loc_csv.close()


    # We now have a dictionary in memory we can get our locations from as such
    print(loc_dict['ABT'])
    print(loc_dict['ABT']['lat'])

    with open(args.input) as csvfile:
        reader = csv.DictReader(csvfile)
        years=["2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","2003"]
        months=["12","11","10","09","08","07","06","05","04","03","02","01"]
        i = 1
        for row in reader:
            print(i)
            i+=1
            for year in years:
                for month in months:
                    if '{}-{}'.format(year,month) == row['MONTH']:
                            try:                 
                                latitude = loc_dict['{}'.format(row['SYMBOL'])]['lat']
                                longitude = loc_dict['{}'.format(row['SYMBOL'])]['long']
                                # If we find Symbol in dict, write the row
                                with open('output/{}-{}.csv'.format(year, month), 'a') as tmp:
                                    tmp.write('"{}",{},{},{},{},'.format(row['SYMBOL'],
                                                                       latitude,
                                                                       longitude,
                                                                       row['CLOSE'],
                                                                       row['VOLUME']))
                            except Exception as e:
                                print(e)
                                #print('{},{},{},{},{}'.format(row['SYMBOL'],
                                #                              latitude,
                                #                              longitude,
                                #                              row['CLOSE'],
                                #                              row['VOLUME']))

                            #else:
                                #print("Error: symbol '{}' not found in location file".format(row['SYMBOL']))

if __name__ == '__main__':
    main()
