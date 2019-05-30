import os
import argparse
import fileinput

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--directory', type=str)
    args = parser.parse_args()

    files = []
    for filename in os.listdir(args.directory):
        files.append(filename)

    print(files)

    new_file = open('{}/test.json'.format(args.directory), 'a')
    new_file.write('["stocks", ')

    for item in files:
        file = open('{}/{}'.format(args.directory, item), 'r')
        for line in file:
            print(line)
            new_file.write('["{}", [{}]],'.format(item.split('.')[0], line[:-1]))

    new_file.write(']')
    new_file.close()

if __name__ == '__main__':
    main()
