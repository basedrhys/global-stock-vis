
# coding: utf-8

# In[38]:


import pandas as pd
import json

population_dir = 'project/data/pop/cities.csv'


# In[7]:


df = pd.read_csv(population_dir)

output = []
output.append("population")

years = ['2020']


# In[39]:


for year in years:
    output_array = []
    output_array.append(year)
    output_array.append([])
    for index, row in df.iterrows():
        # Get the values from the row and append it to our json array
        output_array[1].append(row['City'])
        output_array[1].append(row['Country'])
        output_array[1].append(row['Latitude'])
        output_array[1].append(row['Longitude'])
        output_array[1].append(row['pop' + year])

    output.append(output_array)

output_file = open('project/data/pop/cities_processed.json', mode='w+')
json.dump(output, output_file, sort_keys=True, indent=4)
output_file.close()
#     this_year = df[['City', 'Country', 'Latitude', 'Longitude', 'pop' + year]]
#     print(this_year.head(100))

