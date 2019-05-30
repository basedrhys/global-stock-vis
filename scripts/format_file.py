import json
import argparse
import fileinput

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input', type=str)
    args=parser.parse_args()

    data = None
    myfile = None

    with fileinput.FileInput(args.input, inplace=True, backup='.bak') as file:
        for line in file:
            if line.startswith('}'):
                print(line.replace('}', '},'),end='')
            else:
                print(line, end='')

if __name__ == '__main__':
    main()
